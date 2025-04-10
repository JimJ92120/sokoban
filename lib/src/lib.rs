use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

mod sokoban;
use sokoban::*;

//
#[wasm_bindgen]
#[derive(Debug, Serialize, Deserialize)]
pub struct Game {
    sokoban: Sokoban,
}

#[wasm_bindgen]
impl Game {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            sokoban: Sokoban::new(),
        }
    }

    // getters
    #[wasm_bindgen(getter)]
    pub fn board(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.sokoban.board().clone()).unwrap()
    }

    #[wasm_bindgen(getter)]
    pub fn player_position(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.sokoban.player_position().clone()).unwrap()
    }

    #[wasm_bindgen(getter)]
    pub fn level(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.sokoban.level().clone()).unwrap()
    }

    #[wasm_bindgen(getter)]
    pub fn is_complete(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.sokoban.is_complete().clone()).unwrap()
    }

    #[wasm_bindgen(getter)]
    pub fn move_count(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.sokoban.move_count().clone()).unwrap()
    }

    #[wasm_bindgen(getter)]
    pub fn objects_positions(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.sokoban.objects_positions().clone()).unwrap()
    }

    //
    #[wasm_bindgen]
    pub fn update_player_position(&mut self, position: JsValue) -> bool {
        let position: [isize; 2] = serde_wasm_bindgen::from_value(position).unwrap();

        self.sokoban.update_player_position(position)
    }

    #[wasm_bindgen]
    pub fn update_level(&mut self, new_level: JsValue) -> bool {
        let new_level: usize = serde_wasm_bindgen::from_value(new_level).unwrap();

        self.sokoban.update_level(new_level)
    }
}
