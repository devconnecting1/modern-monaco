import { Part } from "../part";
import { Parts } from "../types";

export interface SidebarView {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
}

export class SidebarPart extends Part {
  readonly id = Parts.SIDEBAR_PART;

  private _views: SidebarView[] = [];
  private _activeViewId: string | null = null;
  private _contentContainer: HTMLElement | null = null;
  private _titleElement: HTMLElement | null = null;

  constructor() {
    super({ minimumWidth: 170, maximumWidth: 500 });
  }

  protected createTitleArea(): HTMLElement {
    const el = document.createElement("div");
    el.classList.add("ide-sidebar-title");
    el.style.cssText = `
      display: flex; align-items: center; padding: 0 12px;
      height: 35px; font-size: 11px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.5px;
      color: var(--ide-sidebar-foreground, #bbbbbb);
      border-bottom: 1px solid var(--ide-border, #252526);
      user-select: none;
    `;
    this._titleElement = document.createElement("span");
    el.appendChild(this._titleElement);
    return el;
  }

  protected createContentArea(): HTMLElement {
    const el = document.createElement("div");
    el.classList.add("ide-sidebar-content");
    el.style.cssText = "overflow: auto; flex: 1;";
    this._contentContainer = el;
    return el;
  }

  setViews(views: SidebarView[]): void {
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
    if (!this._contentContainer) return;
    this._contentContainer.innerHTML = "";

    const active = this._views.find((v) => v.id === this._activeViewId);
    if (this._titleElement) {
      this._titleElement.textContent = active?.label ?? "EXPLORER";
    }

    const placeholder = document.createElement("div");
    placeholder.style.cssText = "padding: 12px; color: var(--ide-descriptionForeground, #858585); font-size: 12px;";
    placeholder.textContent = `View: ${active?.label ?? "None"}`;
    this._contentContainer.appendChild(placeholder);
  }
}
