export type {
  IEditorInput,
  ITextModel,
  ICodeEditor,
  IEditorGroup,
  IEditorOpenOptions,
  IEditorService,
} from "./services/editor-service";

export type {
  IWorkbenchLayoutService,
  ILayoutChangeEvent,
} from "./services/layout-service";

export type {
  IStatusbarEntry,
  IStatusbarEntryAccessor,
  IStatusbarService,
} from "./services/statusbar-service";

export type {
  IAgent,
  IAgentConfig,
  IAgentService,
  AgentMessage,
  AgentToolCall,
  AgentToolDefinition,
  AgentToolParameter,
} from "./services/agent-service";

export type {
  ITerminal,
  ITerminalService,
} from "./services/terminal-service";

export { StatusbarAlignment } from "./services/statusbar-service";
export { AgentStatus, GroupDirection } from "./services/editor-service";

export type { IDisposable, IEvent } from "./event";
export { Emitter } from "./event";

export type {
  Parts,
  Position,
  Orientation,
  Sizing,
  Dimension,
  IPartOptions,
  IEditorOptions,
  IWorkbenchConfiguration,
  EditorGroupSizing,
} from "./types";

export { Workbench, type IWorkbenchOptions } from "./workbench";
export { WorkbenchLayout } from "./layout";
export { Part, type ISerializableView } from "./part";
export { contributionRegistry, registerContribution, WorkbenchPhase } from "./contributions";

export { TitleBarPart } from "./parts/titlebar";
export { ActivityBarPart, type ActivityBarItem } from "./parts/activitybar";
export { SidebarPart, type SidebarView } from "./parts/sidebar";
export { EditorPart, type EditorTab } from "./parts/editor";
export { PanelPart, type PanelView } from "./parts/panel";
export { AuxiliaryBarPart } from "./parts/auxiliarybar";
export { StatusbarPart, type StatusbarItem } from "./parts/statusbar";
export { BannerPart } from "./parts/banner";

export {
  MonacoService,
  MonacoEditorAdapter,
  MonacoEditorInput,
  MonacoWorkspaceAdapter,
  type MonacoNamespace,
  type MonacoCodeEditor,
  type MonacoTextModel,
  type MonacoUri,
  type MonacoInitOptions,
  type MonacoEditorInputInit,
  type MonacoEditorAdapterOptions,
  type WorkspaceFile,
  type WorkspaceAdapterOptions,
} from "./monaco/index";
