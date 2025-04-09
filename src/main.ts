// @ts-ignore
import init, { Game } from "../dist/lib";

import { App } from "./App";
import Engine from "./engine";
import Renderer2D, {
  RendererObject,
  RendererObjectType,
  RendererOptions,
} from "./engine/Renderer2D";
import EventsManager, { EventObject } from "./engine/EventsManager";

async function loadTextures(imageSources: string[]): Promise<Promise<any>[]> {
  return await Promise.all(
    imageSources.map(
      (imageSrc) =>
        new Promise((resolve) => {
          const _image = new Image();
          _image.src = imageSrc;
          _image.addEventListener("load", () => {
            console.log(`${_image.src} loaded`);

            return resolve(_image);
          });
        })
    )
  );
}

window.addEventListener("load", () => {
  init().then(async () => {
    const app = new App("app", "Sokoban");
    app.render();

    //
    const game: Game = new Game();

    // data

    const textures = await loadTextures([
      "./block.png",
      "./box.png",
      "./player.png",
    ]);
    console.log(textures);
    console.log("ok");

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

    const playerObject: RendererObject = {
      id: "player",
      position: game.player_position,
      data: [
        [0, 0, 0],
        [0, 1, 0],
        [1, 1, 0],
        [1, 0, 0],
      ],
      color: [100, 100, 255, 1],
      texture: await textures[2],
      scale: [1, 1],
      rotation: [0, 0, 0],
      type: RendererObjectType.Filled,
    };
    const [blockObjects, targetObjects, boxObjects] = (
      game.objects_positions as [number, number][][]
    ).map(
      (group, groupIndex) =>
        group.map((position, objectIndex) => {
          const _default = {
            position,
            data: [
              [0, 0, 0],
              [0, 1, 0],
              [1, 1, 0],
              [1, 0, 0],
            ],
            scale: [1, 1],
            rotation: [0, 0, 0],
            type: RendererObjectType.Filled,
          };

          switch (groupIndex) {
            case 0:
              return {
                id: `block-${objectIndex}`,
                color: [125, 125, 125, 1],
                texture: textures[0],
                ..._default,
              };

            case 1:
              return {
                id: `target-${objectIndex}`,
                color: [250, 250, 200, 1],
                ..._default,
              };

            case 2:
              return {
                id: `box-${objectIndex}`,
                color: [200, 150, 0, 1],
                texture: textures[1],
                ..._default,
              };

            default:
              break;
          }
        }) as RendererObject[]
    );
    const boxLineObjects: RendererObject[] = boxObjects.map(
      (object, objectIndex) => {
        return {
          ...object,
          id: `box-line-${objectIndex}`,
          data: [
            [0, 0, 0],
            [1, 1, 0],
            [0, 1, 0],
            [1, 0, 0],
          ],
          color: [0, 0, 0, 1],
          type: RendererObjectType.Lines,
        };
      }
    );

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
    ];

    // setup
    const renderer = new Renderer2D(
      app.$container.querySelector("#scene")!,
      rendererOptions
    );
    const eventsManager = new EventsManager(eventObjects);
    const engine = new Engine(renderer);

    // bind
    [
      playerObject,
      ...blockObjects,
      ...targetObjects,
      ...boxObjects,
      ...boxLineObjects,
    ].map((object) => renderer.add(object));

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
          playerObject.position = game.player_position;

          // maybe expensive
          [...Array(game.objects_positions[2].length).keys()].map(
            (boxIndex) => {
              boxObjects[boxIndex].position =
                game.objects_positions[2][boxIndex];
              boxLineObjects[boxIndex].position =
                game.objects_positions[2][boxIndex];
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
