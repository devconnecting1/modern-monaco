import { Part } from "../part";
import { Parts } from "../types";

export class TitleBarPart extends Part {
  readonly id = Parts.TITLEBAR_PART;

  private _titleElement: HTMLElement | null = null;
  private _actionsElement: HTMLElement | null = null;

  constructor() {
    super({ minimumHeight: 35, maximumHeight: 35 });
  }

  protected createTitleArea(): HTMLElement {
    const el = document.createElement("div");
    el.classList.add("ide-titlebar");
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.padding = "0 8px";
    el.style.height = "35px";
    el.style.boxSizing = "border-box";
    el.style.userSelect = "none";

    this._titleElement = document.createElement("div");
    this._titleElement.classList.add("ide-titlebar-title");
    this._titleElement.style.flex = "1";
    this._titleElement.style.textAlign = "center";
    this._titleElement.style.fontSize = "12px";
    this._titleElement.style.color = "var(--ide-title-foreground, #cccccc)";
    this._titleElement.textContent = "IDE";

    this._actionsElement = document.createElement("div");
    this._actionsElement.classList.add("ide-titlebar-actions");
    this._actionsElement.style.display = "flex";
    this._actionsElement.style.gap = "4px";

    el.appendChild(this._actionsElement);
    el.appendChild(this._titleElement);

    return el;
  }

  protected createContentArea(): HTMLElement {
    return document.createElement("div");
  }

  setTitle(title: string): void {
    if (this._titleElement) {
      this._titleElement.textContent = title;
    }
  }

  addAction(label: string, handler: () => void): void {
    if (!this._actionsElement) return;

    const btn = document.createElement("button");
    btn.classList.add("ide-titlebar-action");
    btn.textContent = label;
    btn.style.cssText = "background:none;border:none;color:inherit;cursor:pointer;padding:2px 6px;font-size:12px;border-radius:3px;";
    btn.addEventListener("click", handler);
    this._actionsElement.appendChild(btn);
  }
}
