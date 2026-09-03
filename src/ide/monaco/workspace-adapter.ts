import { Emitter, type IDisposable } from "../event";
import type { MonacoService, MonacoTextModel } from "./monaco-service";
import { MonacoEditorInput } from "./editor-adapter";

export interface WorkspaceFile {
  readonly path: string;
  readonly content: string;
  readonly language?: string;
}

export interface WorkspaceAdapterOptions {
  readonly monaco: MonacoService;
  readonly name?: string;
  readonly initialFiles?: Record<string, string>;
}

export class MonacoWorkspaceAdapter {
  private readonly _files = new Map<string, WorkspaceFile>();
  private readonly _inputs = new Map<string, MonacoEditorInput>();
  private readonly _monaco: MonacoService;
  private readonly _name: string;

  private readonly _onDidOpenFile = new Emitter<WorkspaceFile>();
  readonly onDidOpenFile = this._onDidOpenFile.event;

  private readonly _onDidCreateModel = new Emitter<MonacoTextModel>();
  readonly onDidCreateModel = this._onDidCreateModel.event;

  private readonly _onDidChangeFile = new Emitter<{
    path: string;
    content: string;
  }>();
  readonly onDidChangeFile = this._onDidChangeFile.event;

  constructor(options: WorkspaceAdapterOptions) {
    this._monaco = options.monaco;
    this._name = options.name ?? "workspace";

    if (options.initialFiles) {
      for (const [path, content] of Object.entries(options.initialFiles)) {
        this._files.set(path, {
          path,
          content,
          language: this._guessLanguage(path),
        });
      }
    }
  }

  get files(): ReadonlyMap<string, WorkspaceFile> {
    return this._files;
  }

  get name(): string {
    return this._name;
  }

  addFile(path: string, content: string, language?: string): void {
    const file: WorkspaceFile = {
      path,
      content,
      language: language ?? this._guessLanguage(path),
    };
    this._files.set(path, file);
    this._onDidOpenFile.fire(file);
  }

  removeFile(path: string): void {
    this._files.delete(path);
    const input = this._inputs.get(path);
    if (input) {
      input.dispose();
      this._inputs.delete(path);
    }
  }

  updateFileContent(path: string, content: string): void {
    const existing = this._files.get(path);
    if (existing) {
      const updated: WorkspaceFile = { ...existing, content };
      this._files.set(path, updated);
      this._onDidChangeFile.fire({ path, content });

      const input = this._inputs.get(path);
      if (input) {
        input.updateContent(content);
      }
    }
  }

  getInput(path: string): MonacoEditorInput {
    let input = this._inputs.get(path);
    if (input) return input;

    const file = this._files.get(path);
    input = new MonacoEditorInput(
      this._monaco,
      path,
      path.split("/").pop(),
      file?.content ?? "",
      file?.language,
    );

    this._inputs.set(path, input);
    return input;
  }

  async openFile(path: string): Promise<MonacoTextModel | undefined> {
    const input = this.getInput(path);
    const model = await input.resolve();
    this._onDidCreateModel.fire(model);
    return model;
  }

  readFile(path: string): string | undefined {
    return this._files.get(path)?.content;
  }

  getLanguage(path: string): string {
    return this._files.get(path)?.language ?? this._guessLanguage(path);
  }

  listFiles(): WorkspaceFile[] {
    return Array.from(this._files.values());
  }

  listModels(): MonacoTextModel[] {
    const models: MonacoTextModel[] = [];
    for (const input of this._inputs.values()) {
      const model = input.model;
      if (model) models.push(model);
    }
    return models;
  }

  private _guessLanguage(path: string): string {
    const ext = path.split(".").pop()?.toLowerCase() ?? "";
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
    for (const input of this._inputs.values()) {
      input.dispose();
    }
    this._inputs.clear();
    this._onDidOpenFile.dispose();
    this._onDidCreateModel.dispose();
    this._onDidChangeFile.dispose();
  }
}
