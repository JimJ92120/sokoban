class App {
  readonly $container: HTMLElement;
  private title: string;
  private $debug: HTMLPreElement | null = null;

  constructor(containerId: string, title: string) {
    this.$container = document.querySelector(`#${containerId}`)!;
    this.title = title;
  }

  render() {
    this.$container.innerHTML = `
  <h1>${this.title}</h1>

  <canvas id="scene"></canvas>

  <div>
    <label>Select a level:</label>
    <br />
    <select id="level">
      ${[...Array(2).keys()].reduce(
        (_result, index) =>
          _result + `<option value=${index}>level ${index + 1}</option>`,
        ""
      )}
    </select>
  </div>

  <p>
    <pre id="debug"></pre>
  </p>

  <style>
    #scene {
      margin-bottom: 1rem;
    }
  </style>
    `;

    this.$debug = this.$container.querySelector("#debug");
  }

  debug(text: string) {
    if (this.$debug) {
      this.$debug.innerText = text;
    }
  }
}

export { App };
