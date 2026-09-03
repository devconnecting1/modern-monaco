import { Part } from "../part";
import { Parts } from "../types";

export interface PanelView {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
}

export class PanelPart extends Part {
  readonly id = Parts.PANEL_PART;

  private _views: PanelView[] = [];
  private _activeViewId: string | null = null;
  private _tabBar: HTMLElement | null = null;
  private _contentContainer: HTMLElement | null = null;

  constructor() {
    super({ minimumHeight: 77 });
  }

  protected createTitleArea(): HTMLElement {
    const el = document.createElement("div");
    el.classList.add("ide-panel-tabs");
    el.style.cssText = `
      display: flex; align-items: center; height: 35px;
      background: var(--ide-panel-background, #1e1e1e);
      border-top: 1px solid var(--ide-border, #252526);
      padding: 0 8px; gap: 2px;
    `;
    this._tabBar = el;
    return el;
  }

  protected createContentArea(): HTMLElement {
    const el = document.createElement("div");
    el.classList.add("ide-panel-content");
    el.style.cssText = "overflow: auto; flex: 1;";
    this._contentContainer = el;
    return el;
  }

  setViews(views: PanelView[]): void {
    this._views = views;
    if (views.length > 0 && !this._activeViewId) {
      this._activeViewId = views[0].id;
    }
    this._render();
  }

  setActiveView(id: string): void {
    this._activeViewId = id;
    this._render();
  }

  private _render(): void {
    if (!this._tabBar || !this._contentContainer) return;

    this._tabBar.innerHTML = "";
    this._contentContainer.innerHTML = "";

    for (const view of this._views) {
      const tab = document.createElement("div");
      tab.classList.add("ide-panel-tab");
      if (view.id === this._activeViewId) tab.classList.add("active");

      tab.style.cssText = `
        padding: 4px 12px; cursor: pointer; font-size: 11px;
        text-transform: uppercase; letter-spacing: 0.3px; border-radius: 3px;
        color: ${view.id === this._activeViewId ? "var(--ide-tab-activeForeground, #ffffff)" : "var(--ide-tab-inactiveForeground, #858585)"};
      `;

      tab.textContent = view.label;
      tab.addEventListener("click", () => this.setActiveView(view.id));
      this._tabBar.appendChild(tab);
    }

    const active = this._views.find((v) => v.id === this._activeViewId);
    const placeholder = document.createElement("div");
    placeholder.style.cssText = "padding: 12px; color: var(--ide-descriptionForeground, #858585); font-size: 12px;";
    placeholder.textContent = `Panel: ${active?.label ?? "None"}`;
    this._contentContainer.appendChild(placeholder);
  }
}
