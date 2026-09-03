import { Part } from "../part";
import { Parts } from "../types";
import { Emitter } from "../event";
import type { IEditorInput } from "../services/editor-service";

export interface EditorTab {
  readonly input: IEditorInput;
  readonly active: boolean;
  readonly dirty: boolean;
}

export interface EditorPartMountOptions {
  readonly onEditorReady?: (editor: unknown) => void;
  readonly onModelChange?: (model: unknown) => void;
}

export class EditorPart extends Part {
  readonly id = Parts.EDITOR_PART;

  private _tabs: EditorTab[] = [];
  private _tabBar: HTMLElement | null = null;
  private _editorContainer: HTMLElement | null = null;
  private _editorElement: HTMLElement | null = null;

  private _monacoAdapter: unknown | null = null;
  private _currentInput: IEditorInput | null = null;

  private readonly _onDidActiveTabChange = new Emitter<IEditorInput | null>();
  readonly onDidActiveTabChange = this._onDidActiveTabChange.event;

  private readonly _onDidMount = new Emitter<unknown>();
  readonly onDidMount = this._onDidMount.event;

  constructor() {
    super({ minimumWidth: 200, minimumHeight: 100 });
  }

  protected createTitleArea(): HTMLElement {
    const el = document.createElement("div");
    el.classList.add("ide-editor-tabs");
    el.style.cssText = `
      display: flex; align-items: center; height: 35px;
      background: var(--ide-editor-background, #1e1e1e);
      border-bottom: 1px solid var(--ide-border, #252526);
      overflow-x: auto; overflow-y: hidden;
    `;
    this._tabBar = el;
    return el;
  }

  protected createContentArea(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.classList.add("ide-editor-pane");
    wrapper.style.cssText = "position: relative; overflow: hidden;";

    this._editorContainer = wrapper;
    return wrapper;
  }

  mountEditor(adapter: unknown): void {
    this._monacoAdapter = adapter;
    this._onDidMount.fire(adapter);
  }

  getEditorElement(): HTMLElement | null {
    return this._editorElement;
  }

  openTab(input: IEditorInput): void {
    const existing = this._tabs.find((t) => t.input === input);
    if (existing) {
      this._tabs = this._tabs.map((t) => ({
        ...t,
        active: t.input === input,
      }));
    } else {
      this._tabs = this._tabs.map((t) => ({ ...t, active: false }));
      this._tabs.push({ input, active: true, dirty: false });
    }

    this._currentInput = input;
    this._renderTabs();
    this._onDidActiveTabChange.fire(input);
  }

  closeTab(input: IEditorInput): void {
    const idx = this._tabs.findIndex((t) => t.input === input);
    if (idx === -1) return;

    this._tabs.splice(idx, 1);

    if (input.dispose) {
      input.dispose();
    }

    if (this._tabs.length > 0) {
      const newActive = this._tabs[Math.min(idx, this._tabs.length - 1)];
      this._tabs = this._tabs.map((t) => ({
        ...t,
        active: t.input === newActive.input,
      }));
      this._currentInput = newActive.input;
    } else {
      this._currentInput = null;
    }

    this._renderTabs();
  }

  markDirty(input: IEditorInput, dirty: boolean): void {
    this._tabs = this._tabs.map((t) =>
      t.input === input ? { ...t, dirty } : t,
    );
    this._renderTabs();
  }

  getActiveTab(): EditorTab | undefined {
    return this._tabs.find((t) => t.active);
  }

  getActiveInput(): IEditorInput | null {
    return this._currentInput;
  }

  getTabs(): readonly EditorTab[] {
    return this._tabs;
  }

  protected override doLayout(width: number, height: number): void {
    if (this._editorContainer) {
      const event = new CustomEvent("editor-layout", {
        detail: { width, height },
      });
      this._editorContainer.dispatchEvent(event);
    }
  }

  private _renderTabs(): void {
    if (!this._tabBar) return;
    this._tabBar.innerHTML = "";

    for (const tab of this._tabs) {
      const tabEl = document.createElement("div");
      tabEl.classList.add("ide-editor-tab");
      if (tab.active) tabEl.classList.add("active");

      tabEl.style.cssText = `
        display: flex; align-items: center; gap: 6px;
        padding: 0 12px; height: 35px; cursor: pointer;
        font-size: 12px; white-space: nowrap; border-right: 1px solid var(--ide-border, #252526);
        color: ${tab.active ? "var(--ide-tab-activeForeground, #ffffff)" : "var(--ide-tab-inactiveForeground, #858585)"};
        background: ${tab.active ? "var(--ide-editor-background, #1e1e1e)" : "var(--ide-tab-inactiveBackground, #2d2d2d)"};
      `;

      if (tab.dirty) {
        const dot = document.createElement("span");
        dot.style.cssText = "width: 8px; height: 8px; border-radius: 50%; background: var(--ide-changed, #e2c08d);";
        tabEl.appendChild(dot);
      }

      const label = document.createElement("span");
      label.textContent = tab.input.name ?? tab.input.typeId;
      tabEl.appendChild(label);

      const closeBtn = document.createElement("span");
      closeBtn.textContent = "\u00d7";
      closeBtn.style.cssText = "margin-left: 4px; opacity: 0.5; font-size: 14px;";
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.closeTab(tab.input);
      });
      tabEl.appendChild(closeBtn);

      tabEl.addEventListener("click", () => {
        this.openTab(tab.input);
      });

      this._tabBar.appendChild(tabEl);
    }
  }

  override dispose(): void {
    this._onDidActiveTabChange.dispose();
    this._onDidMount.dispose();
    super.dispose();
  }
}
