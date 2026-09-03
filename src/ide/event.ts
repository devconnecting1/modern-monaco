export interface IDisposable {
  dispose(): void;
}

export type IEvent<T> = (listener: (e: T) => void) => IDisposable

export class Emitter<T> implements IDisposable {
  private _listeners = new Set<(e: T) => void>();
  private _disposed = false;

  readonly event: IEvent<T> = (listener: (e: T) => void): IDisposable => {
    if (this._disposed) {
      throw new Error("Emitter is disposed");
    }
    this._listeners.add(listener);
    return {
      dispose: () => {
        this._listeners.delete(listener);
      },
    };
  };

  fire(event: T): void {
    if (this._disposed) return;
    for (const listener of this._listeners) {
      listener(event);
    }
  }

  dispose(): void {
    if (this._disposed) return;
    this._disposed = true;
    this._listeners.clear();
  }
}
