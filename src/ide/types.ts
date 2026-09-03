export enum Parts {
  TITLEBAR_PART = "ide.parts.titlebar",
  BANNER_PART = "ide.parts.banner",
  ACTIVITYBAR_PART = "ide.parts.activitybar",
  SIDEBAR_PART = "ide.parts.sidebar",
  PANEL_PART = "ide.parts.panel",
  AUXILIARYBAR_PART = "ide.parts.auxiliarybar",
  EDITOR_PART = "ide.parts.editor",
  STATUSBAR_PART = "ide.parts.statusbar",
}

export enum Position {
  LEFT = "left",
  RIGHT = "right",
  TOP = "top",
  BOTTOM = "bottom",
}

export enum Orientation {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
}

export enum Sizing {
  DISTRIBUTE = "distribute",
  SPLIT = "split",
  AUTO = "auto",
}

export interface Dimension {
  readonly width: number;
  readonly height: number;
}

export interface LayoutGridDescriptor {
  readonly root: Orientation;
  readonly children: (LayoutGridLeafDescriptor | LayoutGridBranchDescriptor)[];
}

export interface LayoutGridLeafDescriptor {
  readonly type: "leaf";
  readonly part: Parts;
  readonly size?: number;
}

export interface LayoutGridBranchDescriptor {
  readonly type: "branch";
  readonly orientation: Orientation;
  readonly children: (LayoutGridLeafDescriptor | LayoutGridBranchDescriptor)[];
  readonly size?: number;
}

export enum EditorGroupSizing {
  DISTRIBUTE = "distribute",
  SPLIT = "split",
  AUTO = "auto",
}

export interface IEditorGroupLayout {
  readonly groups: readonly IEditorGroupLayoutEntry[];
  readonly orientation: Orientation;
}

export interface IEditorGroupLayoutEntry {
  readonly id: string;
  readonly size: number;
}

export interface IPartOptions {
  readonly minimumWidth?: number;
  readonly maximumWidth?: number;
  readonly minimumHeight?: number;
  readonly maximumHeight?: number;
}

export interface IEditorOptions {
  readonly wordWrap?: "off" | "on" | "wordWrapColumn" | "bounded";
  readonly fontSize?: number;
  readonly fontFamily?: string;
  readonly fontLigatures?: boolean;
  readonly lineHeight?: number;
  readonly minimap?: { enabled?: boolean };
  readonly padding?: { top?: number; bottom?: number };
  readonly tabSize?: number;
  readonly readOnly?: boolean;
  readonly theme?: string;
}

export interface IWorkbenchConfiguration {
  readonly sideBar?: {
    readonly position?: Position;
    readonly visible?: boolean;
    readonly size?: number;
  };
  readonly panel?: {
    readonly position?: Position;
    readonly alignment?: "left" | "center" | "right";
    readonly visible?: boolean;
    readonly size?: number;
  };
  readonly activityBar?: {
    readonly visible?: boolean;
  };
  readonly statusBar?: {
    readonly visible?: boolean;
  };
  readonly editor?: {
    readonly showTabs?: "none" | "single" | "multiple";
    readonly groupSizing?: EditorGroupSizing;
  };
}
