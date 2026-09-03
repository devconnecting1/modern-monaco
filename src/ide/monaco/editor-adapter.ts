import { Emitter, type IDisposable } from "../event";
import type {
  MonacoService,
  MonacoCodeEditor,
  MonacoTextModel,
} from "./monaco-service";
import type { IEditorInput } from "../services/editor-service";

export interface MonacoEditorInputInit {
  readonly uri: string;
  readonly name?: string;
  readonly content?: string;
  readonly language?: string;
}

export class MonacoEditorInput implements IEditorInput {
  readonly typeId = "monaco";
  private _model: MonacoTextModel | null = null;
  private _ disposed = false;

  constructor(
    private readonly _monaco: MonacoService,
    public readonly uri: string,
    public readonly name?: string,
    private _content?: string,
    private _language?: string,
  ) {}

  get model(): MonacoTextModel | null {
    return this._model;
  }

  async resolve(): Promise<MonacoTextModel> {
    if (this._model) return this._model;

    const existing = this._monaco.getModel(this.uri);
    if (existing) {
      this._model = existing;
      return this._model;
    }

    const lang = this._language ?? this._guessLanguage(this.uri);
    this._model = this._monaco.createModel(
      this._content ?? "",
      lang,
      this.uri,
    );

    this._model.onWillDisposeModel(() => {
      this._model = null;
    });

    return this._model;
  }

  updateContent(content: string): void {
    this._content = content;
    if (this._model) {
      this._model.setValue(content);
    }
  }

  private _guessLanguage(uri: string): string {
    const ext = uri.split(".").pop()?.toLowerCase() ?? "";
    const map: Record<string, string> = {
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      json: "json",
      html: "html",
      htm: "html",
      css: "css",
      scss: "scss",
      less: "less",
      md: "markdown",
      py: "python",
      rs: "rust",
      go: "go",
      java: "java",
      c: "c",
      cpp: "cpp",
      h: "c",
      sh: "shell",
      bash: "shell",
      yaml: "yaml",
      yml: "yaml",
      xml: "xml",
      sql: "sql",
      graphql: "graphql",
      gql: "graphql",
    };
    return map[ext] ?? "plaintext";
  }

  dispose(): void {
    if (this._disposed) return;
    this._disposed = true;
    this._model?.dispose();
    this._model = null;
  }
}

export interface MonacoEditorAdapterOptions {
  readonly monaco: MonacoService;
}

export class MonacoEditorAdapter {
  private _editor: MonacoCodeEditor | null = null;
  private _container: HTMLElement | null = null;
  private readonly _disposables: IDisposable[] = [];

  private readonly _onDidChangeModel = new Emitter<MonacoTextModel | null>();
  readonly onDidChangeModel = this._onDidChangeModel.event;

  private readonly _onDidContentChange = new Emitter<void>();
  readonly onDidContentChange = this._onDidContentChange.event;

  constructor(private readonly _monaco: MonacoService) {}

  attach(container: HTMLElement): MonacoCodeEditor {
    this._container = container;
    this._editor = this._monaco.createEditor(container);

    this._disposables.push(
      this._editor.onDidChangeModel(() => {
        this._onDidChangeModel.fire(this._editor?.getModel() ?? null);
      }),
    );

    this._disposables.push(
      this._editor.onDidChangeModelContent(() => {
        this._onDidContentChange.fire();
      }),
    );

    return this._editor;
  }

  async openInput(input: MonacoEditorInput): Promise<MonacoTextModel> {
    if (!this._editor) {
      throw new Error("Editor not attached. Call attach() first.");
    }

    const model = await input.resolve();
    this._editor.setModel(model);
    this._editor.focus();
    return model;
  }

  setModel(model: MonacoTextModel | null): void {
    this._editor?.setModel(model);
  }

  getModel(): MonacoTextModel | null {
    return this._editor?.getModel() ?? null;
  }

  getValue(): string {
    return this._editor?.getValue() ?? "";
  }

  setValue(value: string): void {
    this._editor?.setValue(value);
  }

  layout(dimension?: { width: number; height: number }): void {
    this._editor?.layout(dimension);
  }

  focus(): void {
    this._editor?.focus();
  }

  dispose(): void {
    for (const d of this._disposables) {
      d.dispose();
    }
    this._disposables.length = 0;
    this._editor?.dispose();
    this._editor = null;
    this._onDidChangeModel.dispose();
    this._onDidContentChange.dispose();
  }
}
