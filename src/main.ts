// @ts-ignore
import init, { Game } from "../dist/lib";

import { Vec2, Vec3, Vec4 } from "./type";

import { App } from "./App";
import Engine from "./engine";
import Renderer2D, {
  RendererObject,
  RendererObjectType,
  RendererOptions,
} from "./engine/Renderer2D";
import EventsManager, { EventObject } from "./engine/EventsManager";

type TextureData = {
  id: string;
  source: string;
  $image?: HTMLImageElement;
};
async function loadTextures(
  textureDataOptions: TextureData[]
): Promise<TextureData[]> {
  return await Promise.all(
    textureDataOptions.map(
      (textureData) =>
        new Promise((resolve) => {
          const _resolve = () => resolve(textureData);

          if (!textureData.$image) {
            textureData.$image = new Image();
            textureData.$image.src = textureData.source;
            textureData.$image.addEventListener("load", () => {
              console.log(`${textureData.source} loaded`);
              return _resolve();
            });
          } else {
            return _resolve();
          }
        }) as Promise<TextureData>
    )
  );
}

function Square(): Vec3[] {
  return [
    [0, 0, 0],
    [0, 1, 0],
    [1, 1, 0],
    [1, 0, 0],
  ] as Vec3[];
}

type AllObjectsData = {
  player: RendererObject;
  blocks: RendererObject[];
  targets: RendererObject[];
  boxes: RendererObject[];
  boxLines: RendererObject[];
};
type ColorsRecord = { [key: string]: Vec4 };
type TextureDataRecord = { [key: string]: TextureData };
function AllObjects(
  playerPosition: Vec2,
  blockPositions: Vec2[],
  targetPositions: Vec2[],
  boxPositions: Vec2[],
  colors: ColorsRecord,
  textures: TextureDataRecord
): AllObjectsData {
  console.log(textures);
  const _default = {
    data: Square(),
    scale: [1, 1] as Vec2,
    rotation: [0, 0, 0] as Vec3,
    type: RendererObjectType.Filled,
  };

  const playerObject: RendererObject = {
    ..._default,
    id: "player",
    position: playerPosition,
    color: colors.player,
    texture: textures.player.$image,
  };

  const blockObjects = blockPositions.map((position, blockIndex) => {
    return {
      ..._default,
      position,
      id: `block-${blockIndex}`,
      color: colors.block,
      texture: textures.block.$image,
    };
  });

  const targetObjects = targetPositions.map((position, targetIndex) => {
    return {
      ..._default,
      id: `target-${targetIndex}`,
      position,
      color: colors.target,
    };
  });

  const boxObjects = boxPositions.map((position, boxIndex) => {
    return {
      id: `box-${boxIndex}`,
      position,
      color: colors.box,
      texture: textures.box.$image,
      ..._default,
    };
  });

  const boxLineObjects: RendererObject[] = boxObjects.map(
    (object, objectIndex) => {
      return {
        ...object,
        id: `box-line-${objectIndex}`,
        data: (() => {
          const square = Square();

          return [...square, square[0], square[2], square[1], square[3]];
        })(),
        color: colors.boxLine,
        type: RendererObjectType.Lines,
      } as RendererObject;
    }
  );

  return {
    player: playerObject,
    blocks: blockObjects,
    targets: targetObjects,
    boxes: boxObjects,
    boxLines: boxLineObjects,
  };
}

window.addEventListener("load", () => {
  init().then(async () => {
    const app = new App("app", "Sokoban");
    app.render();

    //
    const game: Game = new Game();

    // data
    const textures: TextureDataRecord = (
      await loadTextures([
        {
          id: "player",
          source: "./assets/player.png",
        },
        {
          id: "block",
          source: "./assets/block.png",
        },
        {
          id: "box",
          source: "./assets/box.png",
        },
      ])
    ).reduce((_result, textureData) => {
      _result[textureData.id] = textureData;

      return _result;
    }, {} as TextureDataRecord);
    const colors: ColorsRecord = {
      player: [100, 100, 255, 1], // blue
      block: [125, 125, 125, 1], // grey
      target: [0, 0, 0, 1], // black
      box: [200, 150, 0, 1], // orange
      boxLine: [0, 0, 0, 1],
    };

    const { player, blocks, targets, boxes, boxLines } = AllObjects(
      game.player_position,
      game.objects_positions[0],
      game.objects_positions[1],
      game.objects_positions[2],
      colors,
      textures
    );

    const rendererOptions: RendererOptions = (() => {
      const width = 500;
      const height = 500;
      const rows = game.board.length;
      const columns = game.board[0].length;

      return {
        width,
        height,
        backgroundColor: [255, 255, 255, 1],
        resolution: [width / columns, height / rows],
      };
    })();

    const eventObjects: EventObject<any>[] = [
      {
        name: "test-click",
        eventType: "click",
        $target: app.$container.querySelector("#scene")!,
        dataCallback: ($target: HTMLCanvasElement, event: MouseEvent) => {
          const rect = $target.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;

          return {
            position: [x, y],
          };
        },
      } as EventObject<HTMLCanvasElement>,
      {
        name: "go-to",
        eventType: "keyup",
        $target: document,
        dataCallback: ($target: Document, event: KeyboardEvent) => {
          let direction = null;

          switch (event.key) {
            case "ArrowUp":
              direction = "up";
              break;

            case "ArrowDown":
              direction = "down";
              break;

            case "ArrowLeft":
              direction = "left";
              break;

            case "ArrowRight":
              direction = "right";
              break;

            default:
              break;
          }

          return {
            direction,
          };
        },
      } as EventObject<Document>,
      {
        name: "level-selected",
        eventType: "change",
        $target: app.$container.querySelector("#level")!,
        dataCallback: ($target: HTMLSelectElement, event: InputEvent) => {
          return {
            level: "" !== $target.value ? Number($target.value) : null,
          };
        },
      } as EventObject<HTMLSelectElement>,
    ];

    // setup
    const renderer = new Renderer2D(
      app.$container.querySelector("#scene")!,
      rendererOptions
    );
    const eventsManager = new EventsManager(eventObjects);
    const engine = new Engine(renderer);

    //
    [...blocks, ...targets].map((obj) => renderer.addStatic(obj));
    [player, ...boxes, ...boxLines].map((object) => renderer.add(object));

    //
    eventsManager.addEventListener(eventObjects[0].name, (data: any) => {
      if (!data.position) {
        return;
      }

      console.log("click:", data.position);
    });
    eventsManager.addEventListener(eventObjects[1].name, (data: any) => {
      if (!data.direction) {
        return;
      }

      let positionOffset: [number, number] = [0, 0];

      switch (data.direction) {
        case "up":
          positionOffset[1] = -1;
          break;

        case "down":
          positionOffset[1] = 1;
          break;

        case "left":
          positionOffset[0] = -1;
          break;

        case "right":
          positionOffset[0] = 1;
          break;

        default:
          break;
      }

      if (0 !== positionOffset[0] || 0 !== positionOffset[1]) {
        const updated = game.update_player_position(positionOffset);

        if (updated) {
          player.position = game.player_position;

          // maybe expensive
          [...Array(game.objects_positions[2].length).keys()].map(
            (boxIndex) => {
              boxes[boxIndex].position = game.objects_positions[2][boxIndex];
              boxLines[boxIndex].position = game.objects_positions[2][boxIndex];
            }
          );

          if (game.is_complete) {
            setTimeout(() => {
              engine.stop();

              alert("Finished!");
            }, 100);
          }
        } else {
          console.error(
            `unable to update player position with offset [${positionOffset.join(
              ", "
            )}]`
          );
        }
      }
    });
    eventsManager.addEventListener(eventObjects[2].name, (data: any) => {
      if (null == data.level) {
        return;
      }

      console.log("level-selected:", data.level);
    });

    // loop
    engine.start(() => {
      app.debug(
        `move count: ${game.move_count}\n\n` +
          (game.board as number[][]).reduce(
            (_result, row) => _result + row.join(" ") + "\n",
            ""
          )
      );
    });
  });
});
