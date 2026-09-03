import type { Parts, Dimension, Position, Orientation, IWorkbenchConfiguration } from "./types";
import type { ISerializableView } from "./part";
import { Emitter } from "./event";

export interface IGridNode {
  readonly view: ISerializableView;
  readonly size: number;
}

export interface IGridBranch {
  readonly orientation: Orientation;
  readonly children: (IGridNode | IGridBranch)[];
}

export type GridDescriptor = IGridLeaf | IGridBranchDesc;

export interface IGridLeaf {
  readonly type: "leaf";
  readonly part: Parts;
  readonly size?: number;
}

export interface IGridBranchDesc {
  readonly type: "branch";
  readonly orientation: Orientation;
  readonly children: GridDescriptor[];
  readonly size?: number;
}

class GridNode {
  element: HTMLElement;
  view: ISerializableView | null = null;
  size = 0;
  minSize = 0;
  maxSize = Infinity;
  hidden = false;

  constructor(
    public readonly id: string,
    public readonly orientation: Orientation | null,
  ) {
    this.element = document.createElement("div");
    this.element.classList.add("ide-grid-node", `ide-grid-${id}`);
  }
}

class GridSash {
  private _element: HTMLElement;
  private _position = 0;
  private _dragging = false;

  readonly onDidChange: import("../../util").IDisposable;

  private readonly _onPositionChange = new Emitter<number>();
  readonly event = this._onPositionChange.event;

  constructor(
    private readonly _orientation: Orientation,
    private readonly _container: HTMLElement,
  ) {
    this._element = document.createElement("div");
    this._element.classList.add("ide-grid-sash");
    this._element.style.position = "absolute";

    if (_orientation === Orientation.HORIZONTAL) {
      this._element.style.width = "4px";
      this._element.style.cursor = "col-resize";
      this._element.style.top = "0";
      this._element.style.bottom = "0";
    } else {
      this._element.style.height = "4px";
      this._element.style.cursor = "row-resize";
      this._element.style.left = "0";
      this._element.style.right = "0";
    }

    this._element.addEventListener("mousedown", this._onMouseDown);
    this.onDidChange = this._onPositionChange;
  }

  get element(): HTMLElement {
    return this._element;
  }

  set position(pos: number) {
    this._position = pos;
    if (this._orientation === Orientation.HORIZONTAL) {
      this._element.style.left = `${pos - 2}px`;
    } else {
      this._element.style.top = `${pos - 2}px`;
    }
  }

  private _onMouseDown = (e: MouseEvent): void => {
    e.preventDefault();
    this._dragging = true;
    const startPos = this._orientation === Orientation.HORIZONTAL ? e.clientX : e.clientY;
    const startOffset = this._position;

    const onMouseMove = (ev: MouseEvent): void => {
      if (!this._dragging) return;
      const current = this._orientation === Orientation.HORIZONTAL ? ev.clientX : ev.clientY;
      const delta = current - startPos;
      this._position = startOffset + delta;
      this._onPositionChange.fire(this._position);
    };

    const onMouseUp = (): void => {
      this._dragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  dispose(): void {
    this._element.removeEventListener("mousedown", this._onMouseDown);
    this._element.remove();
    this._onPositionChange.dispose();
  }
}

export class WorkbenchLayout {
  private readonly _container: HTMLElement;
  private readonly _gridContainer: HTMLElement;
  private readonly _parts = new Map<Parts, ISerializableView>();
  private readonly _gridNodes = new Map<Parts, GridNode>();
  private readonly _sashes: GridSash[] = [];
  private _dimension: Dimension = { width: 0, height: 0 };

  private readonly _onDidChangePartVisibility = new Emitter<Parts>();
  readonly onDidChangePartVisibility = this._onDidChangePartVisibility.event;

  private readonly _onDidChangePartSize = new Emitter<Parts>();
  readonly onDidChangePartSize = this._onDidChangePartSize.event;

  private readonly _onDidChangeWindowDimension = new Emitter<Dimension>();
  readonly onDidChangeWindowDimension = this._onDidChangeWindowDimension.event;

  constructor(container: HTMLElement) {
    this._container = container;
    this._container.classList.add("ide-workbench");
    this._container.style.position = "relative";
    this._container.style.overflow = "hidden";

    this._gridContainer = document.createElement("div");
    this._gridContainer.classList.add("ide-grid-container");
    this._gridContainer.style.position = "absolute";
    this._gridContainer.style.inset = "0";
    this._container.appendChild(this._gridContainer);
  }

  registerPart(part: ISerializableView): void {
    this._parts.set(part.id, part);
    const node = new GridNode(part.id, null);
    node.view = part;
    node.minSize = part.minimumWidth || part.minimumHeight;
    node.maxSize = part.maximumWidth || part.maximumHeight;
    this._gridNodes.set(part.id, node);
  }

  getPart(id: Parts): ISerializableView | undefined {
    return this._parts.get(id);
  }

  buildLayout(config: IWorkbenchConfiguration): void {
    this._sashes.forEach((s) => s.dispose());
    this._sashes.length = 0;
    this._gridContainer.innerHTML = "";

    const titleBar = this._parts.get(Parts.TITLEBAR_PART);
    const activityBar = this._parts.get(Parts.ACTIVITYBAR_PART);
    const sideBar = this._parts.get(Parts.SIDEBAR_PART);
    const editorPart = this._parts.get(Parts.EDITOR_PART);
    const panelPart = this._parts.get(Parts.PANEL_PART);
    const auxBar = this._parts.get(Parts.AUXILIARYBAR_PART);
    const statusBar = this._parts.get(Parts.STATUSBAR_PART);

    const sideBarVisible = config.sideBar?.visible !== false;
    const panelVisible = config.panel?.visible === true;
    const auxBarVisible = false;
    const activityBarVisible = config.activityBar?.visible !== false;
    const statusBarVisible = config.statusBar?.visible !== false;

    if (activityBar) activityBar.setVisible(activityBarVisible);
    if (sideBar) sideBar.setVisible(sideBarVisible);
    if (panelPart) panelPart.setVisible(panelVisible);
    if (auxBar) auxBar.setVisible(auxBarVisible);
    if (statusBar) statusBar.setVisible(statusBarVisible);

    const parts = [
      { part: titleBar, visible: !!titleBar },
      { part: activityBar, visible: activityBarVisible },
      { part: sideBar, visible: sideBarVisible },
      { part: editorPart, visible: true },
      { part: panelPart, visible: panelVisible },
      { part: auxBar, visible: auxBarVisible },
      { part: statusBar, visible: statusBarVisible },
    ];

    for (const { part } of parts) {
      if (!part) continue;
      const node = this._gridNodes.get(part.id);
      if (node) {
        this._gridContainer.appendChild(node.element);
        node.element.appendChild(part.element);
      }
    }

    this.layout();
  }

  layout(): void {
    const rect = this._container.getBoundingClientRect();
    this._dimension = { width: rect.width, height: rect.height };

    const titleBar = this._parts.get(Parts.TITLEBAR_PART);
    const activityBar = this._parts.get(Parts.ACTIVITYBAR_PART);
    const sideBar = this._parts.get(Parts.SIDEBAR_PART);
    const editorPart = this._parts.get(Parts.EDITOR_PART);
    const panelPart = this._parts.get(Parts.PANEL_PART);
    const auxBar = this._parts.get(Parts.AUXILIARYBAR_PART);
    const statusBar = this._parts.get(Parts.STATUSBAR_PART);

    const w = this._dimension.width;
    const h = this._dimension.height;

    const titleBarH = titleBar?.visible ? 35 : 0;
    const statusBarH = statusBar?.visible ? 22 : 0;
    const activityBarW = activityBar?.visible ? 48 : 0;
    const sideBarW = sideBar?.visible ? 250 : 0;
    const auxBarW = auxBar?.visible ? 250 : 0;
    const panelH = panelPart?.visible ? Math.floor(h / 3) : 0;

    let topY = 0;

    if (titleBar) {
      titleBar.layout(w, titleBarH, topY, 0);
      topY += titleBarH;
    }

    const middleH = h - titleBarH - statusBarH;
    let leftX = 0;

    if (activityBar) {
      activityBar.layout(activityBarW, middleH, topY, leftX);
      leftX += activityBarW;
    }

    if (sideBar) {
      sideBar.layout(sideBarW, middleH, topY, leftX);
      leftX += sideBarW;
    }

    const editorW = w - leftX - auxBarW;
    const editorH = middleH - panelH;

    if (editorPart) {
      editorPart.layout(editorW, editorH, topY, leftX);
    }

    if (panelPart) {
      panelPart.layout(editorW, panelH, topY + editorH, leftX);
    }

    if (auxBar) {
      auxBar.layout(auxBarW, middleH, topY, leftX + editorW);
    }

    if (statusBar) {
      statusBar.layout(w, statusBarH, h - statusBarH, 0);
    }

    this._onDidChangeWindowDimension.fire(this._dimension);
  }

  getDimension(): Dimension {
    return this._dimension;
  }

  setPartVisible(part: Parts, visible: boolean): void {
    const view = this._parts.get(part);
    if (view) {
      view.setVisible(visible);
      this._onDidChangePartVisibility.fire(part);
      this.layout();
    }
  }

  setPartSize(part: Parts, size: number): void {
    const node = this._gridNodes.get(part);
    if (node) {
      node.size = size;
      this._onDidChangePartSize.fire(part);
      this.layout();
    }
  }

  getPartSize(part: Parts): number {
    return this._gridNodes.get(part)?.size ?? 0;
  }

  dispose(): void {
    this._sashes.forEach((s) => s.dispose());
    this._onDidChangePartVisibility.dispose();
    this._onDidChangePartSize.dispose();
    this._onDidChangeWindowDimension.dispose();
  }
}
