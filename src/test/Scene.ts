type SceneOptions = {
  width: number;
  height: number;
  backgroundColor: string;
};

class Scene {
  private $canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private options: SceneOptions;

  constructor($canvas: HTMLCanvasElement, options: SceneOptions) {
    this.$canvas = $canvas;
    this.context = this.$canvas.getContext("2d")!;
    this.options = options;

    this.setCanvas();
  }

  testRender(
    data: number[],
    position: [number, number],
    size: number,
    color: string
  ): void {
    this.context.fillStyle = color;

    data.map((value) => {
      this.context.fillRect(
        position[0] + value * size,
        position[1] + value * size,
        size,
        size
      );
    });
  }

  private setCanvas(): void {
    this.$canvas.width = this.options.width;
    this.$canvas.height = this.options.height;
    this.$canvas.style.backgroundColor = this.options.backgroundColor;
  }
}

export default Scene;

export { SceneOptions };
