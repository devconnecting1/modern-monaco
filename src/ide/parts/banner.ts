import { Part } from "../part";
import { Parts } from "../types";

export class BannerPart extends Part {
  readonly id = Parts.BANNER_PART;

  private _messageElement: HTMLElement | null = null;
  private _dismissElement: HTMLElement | null = null;
  private _message = "";

  constructor() {
    super({ minimumHeight: 0, maximumHeight: 100 });
    this._visible = false;
  }

  protected createContentArea(): HTMLElement {
    const el = document.createElement("div");
    el.classList.add("ide-banner");
    el.style.cssText = `
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 16px; background: var(--ide-banner-background, #007acc);
      color: var(--ide-banner-foreground, #ffffff); font-size: 13px;
    `;
    el.style.display = "none";

    this._messageElement = document.createElement("span");
    this._dismissElement = document.createElement("button");
    this._dismissElement.textContent = "\u00d7";
    this._dismissElement.style.cssText = "background:none;border:none;color:inherit;cursor:pointer;font-size:16px;margin-left:12px;";
    this._dismissElement.addEventListener("click", () => this.dismiss());

    el.appendChild(this._messageElement);
    el.appendChild(this._dismissElement);

    return el;
  }

  show(message: string): void {
    this._message = message;
    if (this._messageElement) {
      this._messageElement.textContent = message;
    }
    if (this._contentArea) {
      (this._contentArea as HTMLElement).style.display = "flex";
    }
    this._visible = true;
  }

  dismiss(): void {
    if (this._contentArea) {
      (this._contentArea as HTMLElement).style.display = "none";
    }
    this._visible = false;
  }
}
