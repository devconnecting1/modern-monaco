import type { Parts, Dimension, IPartOptions } from "./types";
import { Emitter } from "./event";

export interface ISerializableView {
  readonly id: Parts;
  readonly element: HTMLElement;
  readonly minimumWidth: number;
  readonly maximumWidth: number;
  readonly minimumHeight: number;
  readonly maximumHeight: number;
  readonly onDidChange: import("../../util").IDisposable;
  layout(width: number, height: number, top: number, left: number): void;
  setVisible(visible: boolean): void;
}

export abstract class Part implements ISerializableView {
  private readonly _onDidChange = new Emitter<Dimension>();
  readonly onDidChange = this._onDidChange.event;

  protected _element: HTMLElement | null = null;
  protected _titleArea: HTMLElement | null = null;
  protected _contentArea: HTMLElement | null = null;
  protected _headerArea: HTMLElement | null = null;
  protected _footerArea: HTMLElement | null = null;

  protected _visible = true;
  protected _width = 0;
  protected _height = 0;

  abstract readonly id: Parts;

  readonly minimumWidth: number;
  readonly maximumWidth: number;
  readonly minimumHeight: number;
  readonly maximumHeight: number;

  constructor(options?: IPartOptions) {
    this.minimumWidth = options?.minimumWidth ?? 0;
    this.maximumWidth = options?.maximumWidth ?? Infinity;
    this.minimumHeight = options?.minimumHeight ?? 0;
    this.maximumHeight = options?.maximumHeight ?? Infinity;
  }

  get element(): HTMLElement {
    if (!this._element) {
      throw new Error("Part not yet created");
    }
    return this._element;
  }

  get titleArea(): HTMLElement | null {
    return this._titleArea;
  }

  get contentArea(): HTMLElement | null {
    return this._contentArea;
  }

  get visible(): boolean {
    return this._visible;
  }

  create(parent: HTMLElement): void {
    this._element = document.createElement("div");
    this._element.classList.add("ide-part", this.id.replace("ide.parts.", ""));
    this._element.setAttribute("part", this.id);

    this._headerArea = this.createHeaderArea();
    this._titleArea = this.createTitleArea();
    this._contentArea = this.createContentArea();
    this._footerArea = this.createFooterArea();

    if (this._headerArea) {
      this._element.appendChild(this._headerArea);
    }
    if (this._titleArea) {
      this._element.appendChild(this._titleArea);
    }
    if (this._contentArea) {
      this._element.appendChild(this._contentArea);
    }
    if (this._footerArea) {
      this._element.appendChild(this._footerArea);
    }

    parent.appendChild(this._element);
  }

  protected createHeaderArea(): HTMLElement | null {
    return null;
  }

  protected createTitleArea(): HTMLElement {
    const el = document.createElement("div");
    el.classList.add("ide-part-title");
    return el;
  }

  protected abstract createContentArea(): HTMLElement;

  protected createFooterArea(): HTMLElement | null {
    return null;
  }

  layout(width: number, height: number, top: number, left: number): void {
    this._width = width;
    this._height = height;

    if (!this._element) return;

    this._element.style.position = "absolute";
    this._element.style.top = `${top}px`;
    this._element.style.left = `${left}px`;
    this._element.style.width = `${width}px`;
    this._element.style.height = `${height}px`;

    const titleHeight = this._titleArea?.offsetHeight ?? 0;
    const headerHeight = this._headerArea?.offsetHeight ?? 0;
    const footerHeight = this._footerArea?.offsetHeight ?? 0;
    const contentHeight = height - titleHeight - headerHeight - footerHeight;

    if (this._contentArea) {
      this._contentArea.style.position = "absolute";
      this._contentArea.style.top = `${top + headerHeight + titleHeight}px`;
      this._contentArea.style.left = `${left}px`;
      this._contentArea.style.width = `${width}px`;
      this._contentArea.style.height = `${Math.max(0, contentHeight)}px`;
    }

    this.doLayout(width, contentHeight);
  }

  protected doLayout(width: number, height: number): void {
    // Override in subclasses for internal layout
  }

  setVisible(visible: boolean): void {
    if (this._visible === visible) return;
    this._visible = visible;

    if (this._element) {
      this._element.style.display = visible ? "" : "none";
    }

    this._onDidChange.fire({
      width: this._width,
      height: this._height,
    });
  }

  dispose(): void {
    this._onDidChange.dispose();
    this._element?.remove();
  }
}
