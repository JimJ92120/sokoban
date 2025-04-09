import Renderer2D from "./Renderer2D";

type EngineLoopCallback = () => void;

class Engine {
  private loopId: number = 0;
  private startTimestamp = 0;
  private timestamp: number = 0;
  private framesCount: number = 0;
  //
  private renderer: Renderer2D;

  constructor(renderer: Renderer2D) {
    this.renderer = renderer;
  }

  start(loopCallback: EngineLoopCallback): void {
    this.startTimestamp = Number((Date.now() / 1000).toFixed());
    this.timestamp = this.startTimestamp;

    requestAnimationFrame(() => this.loop(loopCallback));
  }

  stop(): void {
    cancelAnimationFrame(this.loopId);

    this.timestamp = 0;
    this.loopId = 0;
  }

  private loop(loopCallback: EngineLoopCallback): void {
    if (0 < this.loopId) {
      // console.log(`engine loop: ${this.loopId}`);

      loopCallback();
      this.renderer.render();

      this.framesCount++;

      let now = Number((Date.now() / 1000).toFixed()); // seconds
      if (this.timestamp < now) {
        console.log(
          `time: ${this.timestamp - this.startTimestamp}\nframesCount: ${
            this.framesCount
          }`
        );

        this.timestamp = now;
        this.framesCount = 0;
      }
    }

    this.loopId = requestAnimationFrame(() => this.loop(loopCallback));
  }
}

export default Engine;
