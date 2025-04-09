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
  scale: Vec2;
  rotation: Vec3;
  type: RendererObjectType;
};
enum RendererObjectType {
  Lines,
  Filled,
}

class Renderer2D {
  readonly options: RendererOptions;
  private $canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  //
  private objects: { [key: string]: RendererObject } = {};

  constructor($canvas: HTMLCanvasElement, options: RendererOptions) {
    this.$canvas = $canvas;
    this.context = this.$canvas.getContext("2d")!;
    this.options = options;

    this.setCanvas();
    this.clear();
  }

  render(): void {
    this.clear();
    this.renderScene();
    this.renderObjects();
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

    this.$canvas.width = width;
    this.$canvas.height = height;
    this.$canvas.style.backgroundColor = this.rgba(backgroundColor);
  }

  private clear(): void {
    const { width, height } = this.options;

    this.context.clearRect(0, 0, width, height);
  }

  private rgba(color: Vec4): string {
    return `rgba(${color.join(", ")})`;
  }

  //
  private renderScene(): void {
    const { width, height, resolution } = this.options;
    const dimension: Vec2 = [width / resolution[0], height / resolution[1]];

    this.context.strokeStyle = this.rgba([0, 0, 0, 1]);
    this.context.lineWidth = 0.1;
    this.context.beginPath();

    [...Array(dimension[1] - 1).keys()].map((rowIndex) => {
      this.context.moveTo(0, (rowIndex + 1) * resolution[1]);
      this.context.lineTo(height, (rowIndex + 1) * resolution[1]);

      [...Array(dimension[0] - 1).keys()].map((columnIndex) => {
        this.context.moveTo((columnIndex + 1) * resolution[0], 0);
        this.context.lineTo((columnIndex + 1) * resolution[0], width);
      });
    });

    this.context.stroke();
  }

  private renderObjects(): void {
    const { resolution } = this.options;

    Object.keys(this.objects).map((objectId) => {
      const { position, data, color, scale, type, rotation } =
        this.objects[objectId];
      const isLine = RendererObjectType.Lines === type;

      this.context[isLine ? "strokeStyle" : "fillStyle"] = this.rgba(color);

      this.context.beginPath();
      this.rotate(data, rotation).map((vertex, index) => {
        this.context[0 === index ? "moveTo" : "lineTo"](
          position[0] * resolution[0] + vertex[0] * scale[0] * resolution[0],
          position[1] * resolution[1] + vertex[1] * scale[1] * resolution[1]
        );
      });

      this.context[isLine ? "stroke" : "fill"]();
    });
  }

  private rotate(vertices: Vec3[], rotation: Vec3): Vec3[] {
    //

    return vertices;
  }
}

export default Renderer2D;

export { RendererOptions, RendererObject, RendererObjectType };
