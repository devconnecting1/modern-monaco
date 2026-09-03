import type { Parts, IWorkbenchConfiguration } from "./types";
import { WorkbenchLayout } from "./layout";
import { TitleBarPart } from "./parts/titlebar";
import { ActivityBarPart } from "./parts/activitybar";
import { SidebarPart } from "./parts/sidebar";
import { EditorPart } from "./parts/editor";
import { PanelPart } from "./parts/panel";
import { AuxiliaryBarPart } from "./parts/auxiliarybar";
import { StatusbarPart } from "./parts/statusbar";
import { BannerPart } from "./parts/banner";
import { contributionRegistry, WorkbenchPhase } from "./contributions";
import type { ISerializableView } from "./part";
import { MonacoService } from "./monaco/monaco-service";
import { MonacoEditorAdapter } from "./monaco/editor-adapter";
import { MonacoWorkspaceAdapter } from "./monaco/workspace-adapter";
import { Emitter, type IDisposable } from "./event";

export interface IWorkbenchOptions {
  readonly container: HTMLElement;
  readonly configuration?: IWorkbenchConfiguration;
  readonly monaco?: {
    readonly defaultTheme?: string;
    readonly themes?: (string | Record<string, unknown>)[];
    readonly workspace?: {
      readonly name?: string;
      readonly initialFiles?: Record<string, string>;
      readonly entryFile?: string;
    };
  };
  readonly onReady?: (workbench: Workbench) => void;
}

export class Workbench {
  private readonly _container: HTMLElement;
  private readonly _layout: WorkbenchLayout;
  private readonly _configuration: IWorkbenchConfiguration;

  private readonly _parts = new Map<Parts, ISerializableView>();
  private readonly _disposables: IDisposable[] = [];

  private readonly _monacoService: MonacoService;
  private readonly _editorAdapter: MonacoEditorAdapter;
  private readonly _workspaceAdapter: MonacoWorkspaceAdapter | null = null;

  private readonly _onDidReady = new Emitter<void>();
  readonly onDidReady = this._onDidReady.event;

  readonly titleBar: TitleBarPart;
  readonly activityBar: ActivityBarPart;
  readonly sidebar: SidebarPart;
  readonly editor: EditorPart;
  readonly panel: PanelPart;
  readonly auxiliaryBar: AuxiliaryBarPart;
  readonly statusBar: StatusbarPart;
  readonly banner: BannerPart;

  constructor(options: IWorkbenchOptions) {
    this._container = options.container;
    this._configuration = options.configuration ?? {};
    this._layout = new WorkbenchLayout(this._container);

    this.titleBar = new TitleBarPart();
    this.activityBar = new ActivityBarPart();
    this.sidebar = new SidebarPart();
    this.editor = new EditorPart();
    this.panel = new PanelPart();
    this.auxiliaryBar = new AuxiliaryBarPart();
    this.statusBar = new StatusbarPart();
    this.banner = new BannerPart();

    this._monacoService = new MonacoService();
    this._editorAdapter = new MonacoEditorAdapter(this._monacoService);

    if (options.monaco?.workspace) {
      this._workspaceAdapter = new MonacoWorkspaceAdapter({
        monaco: this._monacoService,
        name: options.monaco.workspace.name,
        initialFiles: options.monaco.workspace.initialFiles,
      });
    }

    this._registerAllParts();
    this._buildLayout();
    this._initMonaco(options.monaco);

    contributionRegistry.start(WorkbenchPhase.BlockStartup);
    contributionRegistry.start(WorkbenchPhase.BlockRestore);
    contributionRegistry.start(WorkbenchPhase.AfterRestored);
  }

  private _registerAllParts(): void {
    const parts: ISerializableView[] = [
      this.titleBar,
      this.activityBar,
      this.sidebar,
      this.editor,
      this.panel,
      this.auxiliaryBar,
      this.statusBar,
      this.banner,
    ];

    for (const part of parts) {
      this._layout.registerPart(part);
      this._parts.set(part.id, part);
    }
  }

  private _buildLayout(): void {
    this._layout.buildLayout(this._configuration);
  }

  private async _initMonaco(
    config: IWorkbenchOptions["monaco"],
  ): Promise<void> {
    const editorElement = this.editor.getEditorElement();
    if (!editorElement) return;

    await this._monacoService.initialize({
      defaultTheme: config?.defaultTheme,
      themes: config?.themes,
      workspace: config?.workspace,
    });

    const editor = this._editorAdapter.attach(editorElement);
    this.editor.mountEditor(editor);

    this._disposables.push(
      this._editorAdapter.onDidChangeModel(() => {
        // notify model change
      }),
    );

    this._onDidReady.fire();
  }

  get monaco(): MonacoService {
    return this._monacoService;
  }

  get editorAdapter(): MonacoEditorAdapter {
    return this._editorAdapter;
  }

  get workspace(): MonacoWorkspaceAdapter | null {
    return this._workspaceAdapter;
  }

  async openFile(path: string): Promise<void> {
    if (!this._workspaceAdapter) {
      throw new Error("No workspace configured");
    }

    const input = this._workspaceAdapter.getInput(path);
    await this._editorAdapter.openInput(input);
    this.editor.openTab(input);
  }

  createFile(path: string, content: string): void {
    this._workspaceAdapter?.addFile(path, content);
  }

  getPart<T extends ISerializableView>(id: Parts): T | undefined {
    return this._parts.get(id) as T | undefined;
  }

  layout(): void {
    this._layout.layout();
    if (this._editorAdapter) {
      const dim = this._layout.getDimension();
      this._editorAdapter.layout({ width: dim.width, height: dim.height });
    }
  }

  getDimension() {
    return this._layout.getDimension();
  }

  dispose(): void {
    contributionRegistry.dispose();
    this._layout.dispose();
    this._editorAdapter.dispose();
    this._workspaceAdapter?.dispose();
    this._monacoService.dispose();
    for (const d of this._disposables) {
      d.dispose();
    }
    for (const [, part] of this._parts) {
      if ("dispose" in part && typeof part.dispose === "function") {
        (part as { dispose(): void }).dispose();
      }
    }
    this._onDidReady.dispose();
  }
}
