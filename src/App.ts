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

  <p>
    <pre id="debug"></pre>
  </p>

  <div>
    <label>Level</label>
    <select id="level">
      <option>-- select a level --</option>
      ${[...Array(5).keys()].reduce(
        (_result, index) =>
          _result + `<option value=${index}>level ${index + 1}</option>`,
        ""
      )}
    </select>
  </div>
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
