import { Part } from "../part";
import { Parts } from "../types";

export class AuxiliaryBarPart extends Part {
  readonly id = Parts.AUXILIARYBAR_PART;

  private _titleElement: HTMLElement | null = null;
  private _contentContainer: HTMLElement | null = null;

  constructor() {
    super({ minimumWidth: 170, maximumWidth: 500 });
    this._visible = false;
  }

  protected createTitleArea(): HTMLElement {
    const el = document.createElement("div");
    el.classList.add("ide-auxbar-title");
    el.style.cssText = `
      display: flex; align-items: center; padding: 0 12px;
      height: 35px; font-size: 11px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.5px;
      color: var(--ide-sidebar-foreground, #bbbbbb);
      border-bottom: 1px solid var(--ide-border, #252526);
      user-select: none;
    `;
    this._titleElement = document.createElement("span");
    this._titleElement.textContent = "AUXILIARY";
    el.appendChild(this._titleElement);
    return el;
  }

  protected createContentArea(): HTMLElement {
    const el = document.createElement("div");
    el.classList.add("ide-auxbar-content");
    el.style.cssText = "overflow: auto; flex: 1;";
    this._contentContainer = el;
    return el;
  }

  setTitle(title: string): void {
    if (this._titleElement) {
      this._titleElement.textContent = title;
    }
  }
}
