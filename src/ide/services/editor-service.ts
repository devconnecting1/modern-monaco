import type { IDisposable } from "../event";
import type { IEditorOptions } from "../types";

export interface IEditorInput {
  readonly typeId: string;
  readonly resource?: string | URL;
  readonly name?: string;
  readonly capabilities?: number;
  dispose(): void;
}

export interface ITextModel {
  readonly uri: string;
  readonly languageId: string;
  getValue(): string;
  setValue(value: string): void;
  onDidChangeContent(listener: () => void): IDisposable;
  dispose(): void;
}

export interface ICodeEditor {
  readonly getModel: () => ITextModel | null;
  readonly setModel: (model: ITextModel | null) => void;
  readonly onDidChangeModelContent: (listener: (e: unknown) => void) => IDisposable;
  readonly focus: () => void;
  readonly dispose: () => void;
}

export enum GroupDirection {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
}

export interface IEditorGroup {
  readonly id: string;
  readonly editors: readonly IEditorInput[];
  readonly activeEditor: IEditorInput | null;
  readonly count: number;
  openEditor(input: IEditorInput, options?: IEditorOpenOptions): Promise<void>;
  closeEditor(input: IEditorInput): void;
  setActive(input: IEditorInput): void;
}

export interface IEditorOpenOptions {
  readonly pinned?: boolean;
  readonly sticky?: boolean;
  readonly preserveFocus?: boolean;
  readonly group?: IEditorGroup;
  readonly direction?: GroupDirection;
}

export interface IEditorService {
  readonly _serviceBrand: undefined;
  readonly onDidActiveEditorChange: IDisposable;
  readonly activeEditor: IEditorInput | null;
  readonly groups: readonly IEditorGroup[];
  openEditor(input: IEditorInput, options?: IEditorOpenOptions): Promise<void>;
  openEditors(inputs: readonly IEditorInput[], options?: IEditorOpenOptions): Promise<void>;
  closeEditor(input: IEditorInput): void;
  closeAllEditors(): void;
  createModel(content: string, language: string): ITextModel;
  createEditor(container: HTMLElement, options?: IEditorOptions): ICodeEditor;
}
