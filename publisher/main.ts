import showdown from "showdown";
import Handlebars from "handlebars";

interface Tree {
  name: string;
  path: string;
  childrens?: Tree[];
}

const VAULT_PATH = "../obsidian";
const TARGET_PATH = "..";
const TARGET_NAME = "docs";
const IGNORE = [
  ".obsidian",
];

const prod = true;

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

function scanDirs(path: string, name: string): Tree {
  const node: Tree = { name, path, childrens: [] };
  for (const dirEntry of Deno.readDirSync(path)) {
    if (IGNORE.includes(dirEntry.name)) {
      continue;
    }
    if (dirEntry.isDirectory && !dirEntry.isSymlink) {
      node.childrens!.push(scanDirs(`${path}/${dirEntry.name}`, dirEntry.name));
    } else if (!dirEntry.isSymlink) {
      node.childrens!.push({
        name: dirEntry.name,
        path: `${path}/${dirEntry.name}`,
      });
    }
  }
  return node;
}

function createTreeOnFileSystem(tree: Tree, path: string) {
  if (tree.childrens) {
    Deno.mkdirSync(`${path}/${tree.name}`);
    for (const c of tree.childrens) {
      createTreeOnFileSystem(c, `${path}/${tree.name}`);
    }
    return;
  }
  const name = tree.name.split(".");
  if (name[name.length - 1] !== "md") {
    Deno.copyFileSync(tree.path, `${path}/${tree.name}`);
  } else {
    const mdFile = Deno.readTextFileSync(tree.path);
    const content = converter.makeHtml(mdFile);
    Deno.writeTextFileSync(
      `${path}/${tree.name.replace(".md", ".html")}`,
      template({ content, prod }),
    );
  }
}

function main() {
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

main();

const watcher = Deno.watchFs([".", VAULT_PATH], { recursive: true });
for await (const event of watcher) {
  if (
    event.kind !== "any" && event.kind !== "other" && event.kind !== "access"
  ) {
    template = Handlebars.compile(
      Deno.readTextFileSync("./template/base.html"),
    );
    main();
  }
}
