import { Part } from "../part";
import { Parts } from "../types";

export interface StatusbarItem {
  readonly id: string;
  readonly text: string;
  readonly tooltip?: string;
  readonly color?: string;
  readonly priority: number;
  readonly alignment: "left" | "right";
}

export class StatusbarPart extends Part {
  readonly id = Parts.STATUSBAR_PART;

  private _items: StatusbarItem[] = [];
  private _leftContainer: HTMLElement | null = null;
  private _rightContainer: HTMLElement | null = null;

  constructor() {
    super({ minimumHeight: 22, maximumHeight: 22 });
  }

  protected createContentArea(): HTMLElement {
    const el = document.createElement("footer");
    el.classList.add("ide-statusbar");
    el.style.cssText = `
      display: flex; align-items: center; justify-content: space-between;
      height: 22px; padding: 0 8px;
      background: var(--ide-statusbar-background, #007acc);
      color: var(--ide-statusbar-foreground, #ffffff);
      font-size: 12px; user-select: none;
    `;

    this._leftContainer = document.createElement("div");
    this._leftContainer.style.cssText = "display: flex; align-items: center; gap: 8px;";

    this._rightContainer = document.createElement("div");
    this._rightContainer.style.cssText = "display: flex; align-items: center; gap: 8px;";

    el.appendChild(this._leftContainer);
    el.appendChild(this._rightContainer);

    return el;
  }

  setItems(items: StatusbarItem[]): void {
    this._items = [...items].sort((a, b) => a.priority - b.priority);
    this._render();
  }

  addItem(item: StatusbarItem): void {
    this._items.push(item);
    this._items.sort((a, b) => a.priority - b.priority);
    this._render();
  }

  removeItem(id: string): void {
    this._items = this._items.filter((i) => i.id !== id);
    this._render();
  }

  private _render(): void {
    if (!this._leftContainer || !this._rightContainer) return;
    this._leftContainer.innerHTML = "";
    this._rightContainer.innerHTML = "";

    for (const item of this._items) {
      const el = document.createElement("span");
      el.classList.add("ide-statusbar-item");
      el.textContent = item.text;
      if (item.tooltip) el.title = item.tooltip;
      if (item.color) el.style.color = item.color;
      el.style.cssText += "cursor: default; padding: 0 4px;";

      if (item.alignment === "left") {
        this._leftContainer.appendChild(el);
      } else {
        this._rightContainer.appendChild(el);
      }
    }
  }
}
