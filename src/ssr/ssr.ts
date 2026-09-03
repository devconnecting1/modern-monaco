import type { RenderInput, RenderOptions } from "../render.ts";
// ! external modules, don't remove the `.js` extension
import { getLanguageIdFromPath, initShiki, render } from "../shiki.js";
import type { Highlighter } from "../shiki.ts";

let ssrHighlighter: Highlighter | Promise<Highlighter> | undefined;

/** Render a read-only(mock) editor in HTML string. */
export async function renderToString(input: RenderInput, options?: RenderOptions): Promise<string> {
  const { language, theme, shiki } = options ?? {};
  const filename = typeof input === "string" ? undefined : input.filename;
  if (!ssrHighlighter) {
    ssrHighlighter = initShiki(shiki);
  }
  const highlighter = await ssrHighlighter;
  const promises: Promise<void>[] = [];
  if (theme && !highlighter.getLoadedThemes().includes(theme)) {
    console.info(`[modern-monaco] Loading theme '${theme}' from CDN...`);
    promises.push(highlighter.loadThemeFromCDN(theme));
  }
  if (language || filename) {
    const languageId = language ?? (filename ? getLanguageIdFromPath(filename) : undefined);
    if (languageId && !highlighter.getLoadedLanguages().includes(languageId)) {
      console.info(`[modern-monaco] Loading grammar '${languageId}' from CDN...`);
      promises.push(highlighter.loadGrammarFromCDN(languageId));
    }
  }
  if (promises.length > 0) {
    await Promise.all(promises);
  }
  return render(highlighter, input, options);
}

/** Render a `<monaco-editor>` component in HTML string. */
export async function renderToWebComponent(input: RenderInput, options?: RenderOptions): Promise<string> {
  const prerender = await renderToString(input, options);
  return (
    "<monaco-editor>" +
    '<script type="application/json" class="monaco-editor-options">' +
    JSON.stringify([input, options]).replaceAll("/", "\\/") +
    "</script>" +
    '<div class="monaco-editor-prerender" style="width:100%;height:100%;">' +
    prerender +
    "</div>" +
    "</monaco-editor>"
  );
}
