import { Part } from "../part";
import { Parts } from "../types";
import { Emitter } from "../event";

export interface ActivityBarItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly tooltip?: string;
}

export class ActivityBarPart extends Part {
  readonly id = Parts.ACTIVITYBAR_PART;

  private _items: ActivityBarItem[] = [];
  private _activeId: string | null = null;
  private _container: HTMLElement | null = null;

  private readonly _onDidActivate = new Emitter<string>();
  readonly onDidActivate = this._onDidActivate.event;

  constructor() {
    super({ minimumWidth: 48, maximumWidth: 48 });
  }

  protected createContentArea(): HTMLElement {
    const el = document.createElement("div");
    el.classList.add("ide-activitybar");
    el.style.display = "flex";
    el.style.flexDirection = "column";
    el.style.alignItems = "center";
    el.style.padding = "4px 0";
    el.style.gap = "2px";
    el.style.width = "48px";
    el.style.boxSizing = "border-box";
    this._container = el;
    return el;
  }

  setItems(items: ActivityBarItem[]): void {
    this._items = items;
    this._render();
  }

  setActive(id: string): void {
    this._activeId = id;
    this._render();
  }

  private _render(): void {
    if (!this._container) return;
    this._container.innerHTML = "";

    for (const item of this._items) {
      const btn = document.createElement("button");
      btn.classList.add("ide-activitybar-item");
      if (item.id === this._activeId) {
        btn.classList.add("active");
      }
      btn.title = item.tooltip ?? item.label;
      btn.style.cssText = `
        width: 40px; height: 40px; display: flex; align-items: center;
        justify-content: center; background: none; border: none;
        cursor: pointer; border-radius: 4px; font-size: 18px;
        color: var(--ide-activitybar-foreground, #858585);
      `;

      if (item.icon) {
        btn.textContent = item.icon;
      } else {
        btn.textContent = item.label.charAt(0).toUpperCase();
      }

      btn.addEventListener("click", () => {
        this._activeId = item.id;
        this._onDidActivate.fire(item.id);
        this._render();
      });

      this._container.appendChild(btn);
    }
  }

  override dispose(): void {
    this._onDidActivate.dispose();
    super.dispose();
  }
}
