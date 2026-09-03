import css from "tm-grammars/grammars/css.json";
import html from "tm-grammars/grammars/html.json";
import javascript from "tm-grammars/grammars/javascript.json";
import json from "tm-grammars/grammars/json.json";
import jsx from "tm-grammars/grammars/jsx.json";
import tsx from "tm-grammars/grammars/tsx.json";
import typescript from "tm-grammars/grammars/typescript.json";
import htmlJsonScript from "./(html)json-script-tag.json";
import inlineCSS from "./(js)inline-css.json";
import inlineHtml from "./(js)inline-html.json";

export const syntaxes = [html, css, javascript, typescript, jsx, tsx, json, htmlJsonScript, inlineHtml, inlineCSS];
