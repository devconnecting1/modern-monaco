// ! external modules, don't remove the `.js` extension
import { start } from "./editor-worker.js";

self.onmessage = (_e) => {
  start(() => ({}));
};
