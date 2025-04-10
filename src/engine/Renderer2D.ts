import { Vec2, Vec3, Vec4 } from "../type";

type RendererOptions = {
  width: number;
  height: number;
  backgroundColor: Vec4;
  resolution: Vec2;
};

type RendererObject = {
  id: string;
  position: Vec2;
  data: Vec3[];
  color: Vec4;
  texture?: CanvasImageSource;
  scale: Vec2;
  rotation: Vec3;
  type: RendererObjectType;
};
type RendererObjectRecord = { [key: string]: RendererObject };
enum RendererObjectType {
  Lines,
  Filled,
}

class Renderer2D {
  readonly options: RendererOptions;
  private $canvas: HTMLCanvasElement;
  private $shadow: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private shadowContext: CanvasRenderingContext2D;
  //
  private objects: RendererObjectRecord = {};
  private staticObjects: RendererObjectRecord = {};
  private background: ImageData | null = null;

  constructor(
    $canvas: HTMLCanvasElement,
    staticObjects: RendererObjectRecord,
    options: RendererOptions
  ) {
    this.$canvas = $canvas;
    this.context = this.$canvas.getContext("2d")!;
    this.$shadow = document.createElement("canvas");
    this.shadowContext = this.$shadow.getContext("2d")!;
    this.staticObjects = staticObjects;
    this.options = options;

    this.setCanvas();
    this.setBackground();
    this.clear();
  }

  render(): void {
    this.clear();
    this.renderBackground(this.context);
    this.renderObjects(this.context, this.objects);
  }

  add(object: RendererObject): boolean {
    if (object.id in this.objects) {
      console.error(`object ${object.id} already added`);

      return false;
    }

    this.objects[object.id] = object;

    return true;
  }

  remove(objectId: string): boolean {
    if (!(objectId in this.objects)) {
      console.error(`object ${objectId} not added`);

      return false;
    }

    delete this.objects[objectId];

    return true;
  }

  private setCanvas(): void {
    const { width, height, backgroundColor } = this.options;

    [this.$canvas, this.$shadow].map(($element) => {
      $element.width = width;
      $element.height = height;
      $element.style.backgroundColor = this.rgba(backgroundColor);
    });
  }

  private setBackground(): void {
    const { width, height } = this.options;

    this.shadowContext.clearRect(0, 0, width, height);

    this.renderScene(this.shadowContext);
    this.renderObjects(this.shadowContext, this.staticObjects);

    this.background = this.shadowContext.getImageData(0, 0, width, height);
  }

  private clear(): void {
    const { width, height } = this.options;

    this.context.clearRect(0, 0, width, height);
  }

  private rgba(color: Vec4): string {
    return `rgba(${color.join(", ")})`;
  }

  //
  private renderScene(context: CanvasRenderingContext2D): void {
    const { width, height, resolution } = this.options;
    const dimension: Vec2 = [width / resolution[0], height / resolution[1]];

    context.strokeStyle = this.rgba([0, 0, 0, 1]);
    context.lineWidth = 0.1;
    context.beginPath();

    [...Array(dimension[1] - 1).keys()].map((rowIndex) => {
      context.moveTo(0, (rowIndex + 1) * resolution[1]);
      context.lineTo(width, (rowIndex + 1) * resolution[1]);

      [...Array(dimension[0] - 1).keys()].map((columnIndex) => {
        context.moveTo((columnIndex + 1) * resolution[0], 0);
        context.lineTo((columnIndex + 1) * resolution[0], height);
      });
    });

    context.stroke();
  }

  private renderBackground(context: CanvasRenderingContext2D): void {
    if (this.background) {
      context.putImageData(this.background, 0, 0);
    }
  }

  private renderObjects(
    context: CanvasRenderingContext2D,
    objects: RendererObjectRecord
  ): void {
    const { resolution } = this.options;

    Object.keys(objects).map((objectId) => {
      const _object = objects[objectId];
      const { position, data, color, scale, type, rotation } = _object;
      const isLine = RendererObjectType.Lines === type;
      let max: Vec2 = [0, 0];

      context[isLine ? "strokeStyle" : "fillStyle"] = this.rgba(color);

      context.beginPath();
      this.rotate(data, rotation).map((vertex, index) => {
        const _position: Vec2 = [
          position[0] * resolution[0] + vertex[0] * scale[0] * resolution[0],
          position[1] * resolution[1] + vertex[1] * scale[1] * resolution[1],
        ];

        context[0 === index ? "moveTo" : "lineTo"](_position[0], _position[1]);

        if (max[0] < _position[0]) {
          max[0] = _position[0];
        }

        if (max[1] < _position[1]) {
          max[1] = _position[1];
        }
      });

      context[isLine ? "stroke" : "fill"]();

      if (_object.texture) {
        let _position: Vec2 = [
          position[0] * resolution[0],
          position[1] * resolution[1],
        ];

        context.drawImage(
          _object.texture,
          _position[0],
          _position[1],
          max[0] - _position[0],
          max[1] - _position[1]
        );
      }
    });
  }

  private rotate(vertices: Vec3[], rotation: Vec3): Vec3[] {
    //

    return vertices;
  }
}

export default Renderer2D;

export { RendererOptions, RendererObject, RendererObjectType };
