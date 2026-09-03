import vitesseDark from "tm-themes/themes/vitesse-dark.json" with { type: "json" };
// ! external modules, don't remove the `.js` extension
import { registerSyntax, registerTheme } from "./core.js";
import { syntaxes } from "./syntaxes/index.ts";

export { errors, hydrate, init, lazy, Workspace } from "./core.js";

// register built-in syntaxes
for (const syntax of syntaxes) {
  registerSyntax(syntax);
}

// register built-in themes
registerTheme(vitesseDark);

// use builtin LSP providers
Object.assign(globalThis, {
  MonacoEnvironment: { useBuiltinLSP: true },
});
