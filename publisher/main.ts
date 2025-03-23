import showdown from "showdown";
import Handlebars from "handlebars";

const prod = true;

const IGNORE = [
  "publisher",
  ".git",
  ".gitignore",
  ".obsidian",
  "docs",
];

showdown.setFlavor("github");
const converter = new showdown.Converter({
  tables: false,
  strikethrough: true,
  extensions: [
    {
      type: "lang",
      regex: /\[(.*?)\]\((.*?)\.md\)/g, // Matches links like [Link](path.md)
      replace: (_: never, linkText: string, url: string) => {
        return `[${linkText}](${url}.html)`; // Replaces .md with .html
      },
    },
  ],
});

const template = Handlebars.compile(
  Deno.readTextFileSync("./template/base.html"),
);

interface Tree {
  name: string;
  path: string;
  childrens?: Tree[];
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
    Deno.removeSync("../docs", { recursive: true });
  } catch (err) {
    console.error(err);
  }

  const tree = scanDirs("..", "docs");
  createTreeOnFileSystem(tree, "..");
}

main();
