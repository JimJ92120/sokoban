class Controls {
  private $container: HTMLElement;
  private $controls: HTMLElement | null = null;
  private className: string;

  constructor($container: HTMLElement, className: string) {
    this.$container = $container;
    this.className = className;
  }

  render() {
    if (!this.$controls) {
      const $element = (() => {
        let _$element = document.createElement("div");
        _$element.innerHTML = this.template();

        return _$element;
      })().querySelector(`.${this.className}`)!;

      this.$container.appendChild($element);
      this.$controls = this.$container.querySelector(`.${this.className}`)!;
    }
  }

  private template(): string {
    return `
<div class="${this.className}">
  <div>
    <label>Range 1</label>
    <input data-id="range-1" type="range" value="0" min="0" max="100"></input>
  </div>
  <div>
    <label>Range 2</label>
    <input data-id="range-2" type="range" value="0" min="0" max="100"></input>
  </div>
</div>
    `;
  }
}

export default Controls;
