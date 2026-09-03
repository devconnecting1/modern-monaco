import type { IDisposable } from "../event";

export interface ITerminal {
  readonly id: string;
  readonly name: string;
  readonly isActive: boolean;
  sendText(text: string): void;
  clear(): void;
  resize(cols: number, rows: number): void;
  onData(listener: (data: string) => void): IDisposable;
  onExit(listener: (exitCode: number) => void): IDisposable;
  dispose(): void;
}

export interface ITerminalService {
  readonly _serviceBrand: undefined;
  readonly onDidTerminalCreated: IDisposable;
  readonly onDidTerminalDisposed: IDisposable;
  readonly terminals: readonly ITerminal[];
  createTerminal(name?: string): ITerminal;
  getTerminal(id: string): ITerminal | undefined;
  setActiveTerminal(id: string): void;
  removeTerminal(id: string): void;
}
