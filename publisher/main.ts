import showdown from "showdown";
import Handlebars from "handlebars";
import matter from "gray-matter";

interface TreeSimpleFile {
  name: string;
  path: string;
}

interface TreeDir extends TreeSimpleFile {
  childrens: Tree[];
}

interface TreeMetadata extends TreeSimpleFile {
  // deno-lint-ignore no-explicit-any
  metadata: Record<string, any>;
  content: string;
}

type Tree = TreeSimpleFile | TreeDir | TreeMetadata;

const VAULT_PATH = "../obsidian";
const TARGET_PATH = "..";
const TARGET_NAME = "docs";
const IGNORE = [
  ".obsidian",
  "templates",
];

const URL = [
  "http://127.0.0.1:8000",
  "https://nicolas-sabbatini.github.io",
];
let SELECTED_URL = 0;

showdown.setFlavor("github");
const converter = new showdown.Converter({
  strikethrough: true,
  extensions: [
    {
      type: "lang",
      regex: /\[(.*?)\]\((.*?)\.md\)/g, // Matches links like [Link](path.md)
      replace: (_: never, linkText: string, url: string) => {
        return `[${linkText}](${url}.html)`; // Replaces .md with .html
      },
    },
    {
      type: "lang",
      regex: /^(#{1,6})\s+(.*)$/gm, // Matches Markdown headers (e.g., # Title)
      replace: function (_: never, hashes: string, title: string) {
        return hashes + " " + hashes + " " + title; // Adds an extra hash after the first hash
      },
    },
  ],
});

let template = Handlebars.compile(
  Deno.readTextFileSync("./template/base.html"),
);

function parseMetadata(
  // deno-lint-ignore no-explicit-any
  meta: Record<string, any>,
  path: string,
  // deno-lint-ignore no-explicit-any
): Record<string, any> {
  meta.titulo = meta.titulo ?? "CoffeeBreak";
  meta.tags = meta.tags && typeof meta.tags !== "string"
    ? meta.tags.join(", ")
    : meta.tags;
  meta.descripcion = meta.descripcion ?? "Bienvenido a mi blog";
  meta.image = meta.image ?? "/assets/favicon.svg";
  meta.path = path;
  return meta;
}

function scanDirs(path: string, name: string): Tree {
  const node: Tree = { name, path, childrens: [] };
  for (const dirEntry of Deno.readDirSync(path)) {
    if (IGNORE.includes(dirEntry.name)) {
      continue;
    }
    if (dirEntry.isDirectory && !dirEntry.isSymlink) {
      node.childrens!.push(scanDirs(`${path}/${dirEntry.name}`, dirEntry.name));
    } else if (!dirEntry.isSymlink) {
      const name = dirEntry.name.split(".");
      if (name[name.length - 1] !== "md") {
        node.childrens!.push({
          name: dirEntry.name,
          path: `${path}/${dirEntry.name}`,
        });
      } else {
        const data = matter.read(`${path}/${dirEntry.name}`);
        node.childrens!.push({
          name: dirEntry.name,
          path: `${path}/${dirEntry.name}`,
          metadata: parseMetadata(
            data.data,
            `${path.replace("../obsidian", "")}/${
              dirEntry.name.replace(".md", ".html")
            }`,
          ),
          content: data.content,
        });
      }
    }
  }
  return node;
}

function createTreeOnFileSystem(tree: Tree, path: string) {
  if ("childrens" in tree) {
    Deno.mkdirSync(`${path}/${tree.name}`);
    for (const c of tree.childrens) {
      createTreeOnFileSystem(c, `${path}/${tree.name}`);
    }
    return;
  } else if ("content" in tree) {
    const content = converter.makeHtml(tree.content);
    Deno.writeTextFileSync(
      `${path}/${tree.name.replace(".md", ".html")}`,
      template({ content, ...tree.metadata, base_url: URL[SELECTED_URL] }),
    );
  } else {
    Deno.copyFileSync(tree.path, `${path}/${tree.name}`);
  }
}

function buildWeb() {
  try {
    console.log(`Eliminado el direcotrio ${TARGET_PATH}/${TARGET_NAME}`);
    Deno.removeSync(`${TARGET_PATH}/${TARGET_NAME}`, { recursive: true });
  } catch (err) {
    console.error(err);
  }
  console.log("Escaneando bóveda");
  const tree = scanDirs(VAULT_PATH, TARGET_NAME);
  console.log("Creando archivos");
  createTreeOnFileSystem(tree, TARGET_PATH);
  console.log("Listo! =D");
}

if (Deno.args[0] === "prod") {
  SELECTED_URL = 1;
}

buildWeb();

if (Deno.args[0] !== "prod") {
  const watcher = Deno.watchFs([".", VAULT_PATH], { recursive: true });
  for await (const event of watcher) {
    if (
      event.kind !== "any" && event.kind !== "other" && event.kind !== "access"
    ) {
      template = Handlebars.compile(
        Deno.readTextFileSync("./template/base.html"),
      );
      buildWeb();
    }
  }
}
