import type { IDisposable } from "./event";

export interface IContributionDescriptor {
  readonly id: string;
  readonly ctor: new (...args: unknown[]) => IWorkbenchContribution;
  readonly phase: WorkbenchPhase;
  readonly lazy?: boolean;
  readonly editorTypeId?: string;
}

export const enum WorkbenchPhase {
  BlockStartup = 1,
  BlockRestore = 2,
  AfterRestored = 3,
  Eventually = 4,
}

export interface IWorkbenchContribution {
  readonly id: string;
  dispose(): void;
}

class ContributionRegistry {
  private readonly _descriptors = new Map<string, IContributionDescriptor>();
  private readonly _instances = new Map<string, IWorkbenchContribution>();
  private _started = false;
  private _phase: WorkbenchPhase = WorkbenchPhase.BlockStartup;

  register(descriptor: IContributionDescriptor): void {
    this._descriptors.set(descriptor.id, descriptor);
    if (this._started) {
      this._tryInstantiate(descriptor);
    }
  }

  start(phase: WorkbenchPhase): void {
    this._started = true;
    this._phase = phase;

    for (const [, descriptor] of this._descriptors) {
      this._tryInstantiate(descriptor);
    }
  }

  private _tryInstantiate(descriptor: IContributionDescriptor): void {
    if (this._instances.has(descriptor.id)) return;
    if (descriptor.lazy) return;
    if (descriptor.phase > this._phase) return;

    try {
      const instance = new descriptor.ctor();
      this._instances.set(descriptor.id, instance);
    } catch {
      // Failed to instantiate contribution
    }
  }

  getContribution(id: string): IWorkbenchContribution | undefined {
    const existing = this._instances.get(id);
    if (existing) return existing;

    const descriptor = this._descriptors.get(id);
    if (descriptor) {
      this._tryInstantiate(descriptor);
      return this._instances.get(id);
    }

    return undefined;
  }

  dispose(): void {
    for (const [, instance] of this._instances) {
      instance.dispose();
    }
    this._instances.clear();
    this._descriptors.clear();
  }
}

export const contributionRegistry = new ContributionRegistry();

export function registerContribution(
  id: string,
  ctor: new (...args: unknown[]) => IWorkbenchContribution,
  phase: WorkbenchPhase = WorkbenchPhase.AfterRestored,
  options?: { lazy?: boolean; editorTypeId?: string },
): IDisposable {
  contributionRegistry.register({
    id,
    ctor,
    phase,
    lazy: options?.lazy,
    editorTypeId: options?.editorTypeId,
  });

  return {
    dispose() {
      const instance = contributionRegistry.getContribution(id);
      instance?.dispose();
    },
  };
}
