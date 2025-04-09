use serde::{Deserialize, Serialize};

// mod helpers;
// use helpers::*;

// mod js;
// use js::*;

type Board = Vec<Vec<usize>>;
type Position = [usize; 2];

//
#[derive(Debug, Serialize, Deserialize)]
pub struct Sokoban {
    player_position: Position,
    board: Board,
    is_complete: bool,
}

// missing checks for position in range
impl Sokoban {
    pub fn new() -> Self {
        Self {
            player_position: [4, 4],
            board: Sokoban::new_board(),
            is_complete: false,
        }
    }

    // getters
    pub fn board(&self) -> Board {
        self.board.clone()
    }

    pub fn player_position(&self) -> Position {
        self.player_position.clone()
    }

    pub fn is_complete(&self) -> bool {
        self.is_complete.clone()
    }

    pub fn objects_positions(&self) -> [Vec<Position>; 3] {
        let mut block_positions: Vec<Position> = vec![];
        let mut target_positions: Vec<Position> = vec![];
        let mut box_positions: Vec<Position> = vec![];

        for row_index in 0..self.board.len() {
            for column_index in 0..self.board[0].len() {
                let position: [usize; 2] = [column_index, row_index];

                match self.board[position[1]][position[0]] {
                    1 => block_positions.push(position),
                    2 => target_positions.push(position),
                    3 => box_positions.push(position),
                    _ => {}
                }
            }
        }

        [block_positions, target_positions, box_positions]
    }

    // static
    fn new_board() -> Board {
        // let columns = 10;
        // let rows = 10;

        // let row: Vec<usize> = (0..columns).into_iter().map(|_| 0).collect();

        // (0..rows).into_iter().map(|_| row.clone()).collect()
        vec![
            vec![1, 1, 1, 1, 1, 1, 1, 1, 1],
            vec![1, 2, 0, 0, 1, 1, 1, 2, 1],
            vec![1, 0, 0, 0, 0, 1, 1, 0, 1],
            vec![1, 1, 0, 0, 0, 0, 3, 0, 1],
            vec![1, 1, 3, 0, 0, 0, 0, 0, 1],
            vec![1, 0, 0, 1, 0, 0, 3, 0, 1],
            vec![1, 0, 1, 1, 0, 0, 1, 1, 1],
            vec![1, 0, 0, 0, 0, 0, 2, 1, 1],
            vec![1, 1, 1, 1, 1, 1, 1, 1, 1],
        ]
    }

    // pub
    pub fn update_player_position(&mut self, direction: [isize; 2]) -> bool {
        let new_position: [isize; 2] = [
            (self.player_position[0] as isize) + direction[0],
            (self.player_position[1] as isize) + direction[1],
        ];

        if !self.is_position_in_board(new_position) {
            return false;
        }

        let new_position = [new_position[0] as usize, new_position[1] as usize];
        let current_new_position_value = self.board[new_position[1]][new_position[0]];

        if 1 == current_new_position_value || 2 == current_new_position_value {
            return false;
        } else if 3 == current_new_position_value {
            let box_new_position: [isize; 2] = [
                new_position[0] as isize + direction[0],
                new_position[1] as isize + direction[1],
            ];

            if !self.is_position_in_board(box_new_position) {
                return false;
            }

            let box_new_position: [usize; 2] =
                [box_new_position[0] as usize, box_new_position[1] as usize];
            let current_new_box_position_value =
                self.board[box_new_position[1]][box_new_position[0]];

            if 0 != current_new_box_position_value && 2 != current_new_box_position_value {
                return false;
            }

            self.board[box_new_position[1]][box_new_position[0]] = 3;
            self.board[new_position[1]][new_position[0]] = 0;

            if 2 == current_new_box_position_value && self.is_board_complete() {
                self.is_complete = true;
            }
        }

        self.player_position = [new_position[0], new_position[1]];

        true
    }

    //
    fn is_position_in_board(&self, position: [isize; 2]) -> bool {
        0 <= position[0]
            && (self.board[0].len() as isize) > position[0]
            && 0 <= position[1]
            && (self.board.len() as isize) > position[1]
    }

    fn is_board_complete(&self) -> bool {
        !self.board.clone().concat().contains(&2)
    }
}
