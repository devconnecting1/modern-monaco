import type { IDisposable } from "../event";

export const enum StatusbarAlignment {
  LEFT = 0,
  RIGHT = 1,
}

export interface IStatusbarEntry {
  readonly text: string;
  readonly tooltip?: string;
  readonly command?: string;
  readonly color?: string;
  readonly backgroundColor?: string;
  readonly priority?: number;
  readonly kind?: "default" | "warning" | "error" | "success" | "info";
}

export interface IStatusbarEntryAccessor {
  update(entry: Partial<IStatusbarEntry>): void;
  dispose(): void;
}

export interface IStatusbarService {
  readonly _serviceBrand: undefined;
  readonly onDidChangeEntries: IDisposable;
  addEntry(
    entry: IStatusbarEntry,
    id: string,
    alignment?: StatusbarAlignment,
  ): IStatusbarEntryAccessor;
  removeEntry(id: string): void;
  getEntries(): ReadonlyArray<IStatusbarEntry & { id: string }>;
}
