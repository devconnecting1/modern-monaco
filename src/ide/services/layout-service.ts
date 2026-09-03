import type { IDisposable } from "../event";
import type {
  Parts,
  Position,
  Dimension,
  IWorkbenchConfiguration,
} from "../types";

export interface ILayoutChangeEvent {
  readonly part: Parts;
  readonly width: number;
  readonly height: number;
  readonly visible: boolean;
}

export interface IWorkbenchLayoutService {
  readonly _serviceBrand: undefined;
  readonly onDidChangePartVisibility: IDisposable;
  readonly onDidChangePartSize: IDisposable;
  readonly onDidChangeWindowDimension: IDisposable;

  isVisible(part: Parts): boolean;
  setVisible(part: Parts, visible: boolean): void;

  getPartSize(part: Parts): number;
  setPartSize(part: Parts, size: number): void;

  getPartPosition(part: Parts): Position;
  setPartPosition(part: Parts, position: Position): void;

  getWindowDimension(): Dimension;
  layout(): void;

  toggleMaximizedPanel(): void;
  toggleZenMode(): void;

  getConfiguration(): IWorkbenchConfiguration;
}
