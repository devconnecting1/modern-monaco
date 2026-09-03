import { Emitter, type IDisposable } from "../event";
import type { IEditorOptions } from "../types";

export interface MonacoNamespace {
  readonly editor: {
    create(
      container: HTMLElement,
      options?: Record<string, unknown>,
    ): MonacoCodeEditor;
    createModel(
      value: string,
      language?: string,
      uri?: MonacoUri | string | URL,
    ): MonacoTextModel;
    getModel(uri: MonacoUri | string | URL): MonacoTextModel | undefined;
    getModels(): MonacoTextModel[];
    defineTheme(id: string, theme: Record<string, unknown>): void;
    setTheme(id: string): void;
    onDidCreateModel(listener: (model: MonacoTextModel) => void): IDisposable;
    onWillDisposeModel(listener: (model: MonacoTextModel) => void): IDisposable;
    setTokensProvider(
      languageId: string,
      provider: Record<string, unknown>,
    ): IDisposable;
    registerLinkOpener(opener: Record<string, unknown>): IDisposable;
    registerEditorOpener(opener: Record<string, unknown>): IDisposable;
    addKeybindingRule(rule: Record<string, unknown>): void;
  };
  readonly languages: {
    register(info: { id: string; extensions?: string[]; aliases?: string[] }): void;
    onLanguage(
      languageId: string,
      callback: () => void,
    ): IDisposable;
    setLanguageConfiguration(
      languageId: string,
      configuration: Record<string, unknown>,
    ): IDisposable;
  };
  readonly Uri: {
    file(path: string): MonacoUri;
    parse(path: string): MonacoUri;
    from(components: {
      scheme?: string;
      authority?: string;
      path?: string;
      query?: string;
      fragment?: string;
    }): MonacoUri;
  };
  readonly Position: new (lineNumber: number, column: number) => MonacoPosition;
  readonly Range: new (
    startLineNumber: number,
    startColumn: number,
    endLineNumber: number,
    endColumn: number,
  ) => MonacoRange;
  readonly KeyMod: Record<string, number>;
  readonly KeyCode: Record<string, number>;
  readonly TokenizationRegistry: Record<string, unknown>;
  readonly editor: MonacoNamespace["editor"];
}

export interface MonacoCodeEditor {
  readonly getModel: () => MonacoTextModel | null;
  readonly setModel: (model: MonacoTextModel | null) => void;
  readonly getValue: () => string;
  readonly setValue: (value: string) => void;
  readonly getOptions: () => Record<string, unknown>;
  readonly updateOptions: (options: Record<string, unknown>) => void;
  readonly focus: () => void;
  readonly dispose: () => void;
  readonly onDidChangeModelContent: (
    listener: (e: unknown) => void,
  ) => IDisposable;
  readonly onDidChangeModel: (
    listener: (e: unknown) => void,
  ) => IDisposable;
  readonly onDidFocusEditorText: (
    listener: () => void,
  ) => IDisposable;
  readonly onDidBlurEditorText: (
    listener: () => void,
  ) => IDisposable;
  readonly onKeyDown: (
    listener: (e: unknown) => void,
  ) => IDisposable;
  readonly getDomNode: () => HTMLElement | null;
  readonly layout: (dimension?: { width: number; height: number }) => void;
  readonly saveViewState: () => unknown;
  readonly restoreViewState: (state: unknown) => void;
  readonly trigger: (source: string, handlerId: string, payload: unknown) => void;
}

export interface MonacoTextModel {
  readonly uri: MonacoUri;
  readonly languageId: string;
  readonly getValue: () => string;
  readonly setValue: (value: string) => void;
  readonly getLanguageId: () => string;
  readonly onDidChangeContent: (listener: (e: unknown) => void) => IDisposable;
  readonly onDidChangeLanguage: (
    listener: (e: { oldLanguage: string; newLanguage: string }) => void,
  ) => IDisposable;
  readonly onWillDisposeModel: (listener: () => void) => IDisposable;
  readonly dispose: () => void;
}

export interface MonacoUri {
  readonly scheme: string;
  readonly authority: string;
  readonly path: string;
  readonly query: string;
  readonly fragment: string;
  toString(): string;
}

export interface MonacoPosition {
  readonly lineNumber: number;
  readonly column: number;
}

export interface MonacoRange {
  readonly startLineNumber: number;
  readonly startColumn: number;
  readonly endLineNumber: number;
  readonly endColumn: number;
}

export interface MonacoInitOptions {
  readonly workspace?: {
    readonly name?: string;
    readonly initialFiles?: Record<string, string | Uint8Array>;
    readonly entryFile?: string;
    readonly browserHistory?: boolean;
  };
  readonly lsp?: Record<string, unknown>;
  readonly defaultTheme?: string;
  readonly themes?: (string | Record<string, unknown>)[];
}

export class MonacoService {
  private _monaco: MonacoNamespace | null = null;
  private _initialized = false;
  private readonly _onDidInitialize = new Emitter<MonacoNamespace>();
  readonly onDidInitialize = this._onDidInitialize.event;

  get monaco(): MonacoNamespace | null {
    return this._monaco;
  }

  get isInitialized(): boolean {
    return this._initialized;
  }

  async initialize(options?: MonacoInitOptions): Promise<MonacoNamespace> {
    if (this._initialized && this._monaco) {
      return this._monaco;
    }

    const mod = await import("../../core.js");
    const monacoNS = await mod.init({
      defaultTheme: options?.defaultTheme ?? "vitesse-dark",
      themes: options?.themes,
      workspace: options?.workspace
        ? new mod.Workspace(options.workspace)
        : undefined,
      lsp: options?.lsp as never,
    });

    this._monaco = monacoNS as unknown as MonacoNamespace;
    this._initialized = true;
    this._onDidInitialize.fire(this._monaco);

    return this._monaco;
  }

  createEditor(
    container: HTMLElement,
    options?: IEditorOptions,
  ): MonacoCodeEditor {
    if (!this._monaco) {
      throw new Error("Monaco not initialized. Call initialize() first.");
    }

    const editorOptions: Record<string, unknown> = {
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: "off",
      fontSize: 14,
      lineHeight: 20,
      padding: { top: 8, bottom: 8 },
      ...options,
    };

    return this._monaco.editor.create(container, editorOptions);
  }

  createModel(
    content: string,
    language?: string,
    uri?: string | URL,
  ): MonacoTextModel {
    if (!this._monaco) {
      throw new Error("Monaco not initialized. Call initialize() first.");
    }

    const modelUri = uri
      ? typeof uri === "string"
        ? this._monaco.Uri.parse(uri)
        : this._monaco.Uri.parse(uri.toString())
      : undefined;

    return this._monaco.editor.createModel(content, language, modelUri);
  }

  getModel(uri: string | URL): MonacoTextModel | undefined {
    if (!this._monaco) return undefined;
    const modelUri =
      typeof uri === "string"
        ? this._monaco.Uri.parse(uri)
        : this._monaco.Uri.parse(uri.toString());
    return this._monaco.editor.getModel(modelUri);
  }

  setTheme(themeId: string): void {
    this._monaco?.editor.setTheme(themeId);
  }

  defineTheme(id: string, theme: Record<string, unknown>): void {
    this._monaco?.editor.defineTheme(id, theme);
  }

  dispose(): void {
    this._onDidInitialize.dispose();
    this._monaco = null;
    this._initialized = false;
  }
}
