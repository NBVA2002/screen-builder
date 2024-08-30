import ReactDOM from "react-dom/client";
import {LowcoderAppView} from "lowcoder-sdk";
import "lowcoder-sdk/dist/style.css";

class WcScreenRenderer extends HTMLElement {
  static readonly observedAttributes = ['app-id', 'base-url', 'input'];

  container: HTMLElement;
  root: ReactDOM.Root;

  constructor() {
    super();

    this.container = this;
    this.root = ReactDOM.createRoot(this.container);
  }

  get appId(): string {
    return this.getAttribute('app-id') ?? '';
  }

  set appId(value: string) {
    this.setAttribute('app-id', value);
  }

  get baseUrl(): string {
    return this.getAttribute('base-url') ?? '';
  }

  set baseUrl(value: string) {
    this.setAttribute('base-url', value);
  }

  get input(): string {
    return this.getAttribute('input') ?? '';
  }

  set input(value: string) {
    this.setAttribute('input', value);
  }

  connectedCallback(): void {
    this.#render();
  }

  disconnectedCallback(): void {
    this.root.unmount()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  attributeChangedCallback(_name: never, _oldValue: never, _newValue: never): void {
    this.#render();
  }

  #render(): void {
    let parsedInput: any = null;
    try {
      parsedInput = JSON.parse(this.input);
      Object.entries(parsedInput).forEach(([key, value]) => {
        if (typeof value != "string") parsedInput[key] = JSON.stringify(value)
      });
    } catch (e) { /* empty */
    }

    if (this.appId) this.root.render(<LowcoderAppView
      appId={this.appId}
      baseUrl={this.baseUrl}
      moduleInputs={parsedInput}
      onModuleEventTriggered={(e: never) => this.dispatchEvent(new CustomEvent('moduleEventTriggered', {detail: e}))}
      onModuleOutputChange={(e: never) => this.dispatchEvent(new CustomEvent('moduleOutputChange', {detail: e}))}
    />);
  }

}

customElements.define("screen-renderer", WcScreenRenderer);