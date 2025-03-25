---
anterior: creando_mi_propio_static_site_generator-03.html
descripcion: Una serie de tutoriales en la cual construimos un static site generator.
image: /assets/markdown-to-html.png
parent: BLOG
parent_url: /blog
siguiente: creando_mi_propio_static_site_generator-05.html
tags:
  - tutorial
  - web
  - html
  - deno
titulo: Creando mi propio static site generator - 04
---

# Creando mi propio Static Site Generator - 04

## Que vamos a hacer

Ya tenemos nuestro mínimo Static Site Generator, capaz de publicar posts, imágenes, etc. Sin embargo, hay un pequeño detalle: las páginas generadas no contienen suficiente información para que los indexadores Web comprendan su contenido y optimicen el SEO.  

Además, si compartimos un enlace a nuestros posts en una red social, este aparecerá como un simple link sin vista previa. 

Para solucionar esto, añadiremos un header en YAML a cada post, donde almacenaremos toda la metadata necesaria. Luego, pasaremos esta información a los templates y así solucionar nuestro pequeño problema.

## Desarrollo

Para leer la metadata de los post, vamos a utilizar la librería [gray-matter](https://github.com/jonschlinkert/gray-matter) para instalarla simplemente corremos el comando.

```bash
deno install npm:gray-matter
```

E importamos la librería.

```ts
import matter from "gray-matter";
```

Y vamos a modificar nuestra estructura de datos `Tree` para que contenga 3 tipos de archivos, un archivo simple el cual tiene que solo ser copiado en nuestra carpeta output, un directorio que tiene que ser creado y un post el cual contiene metadata.

```ts
interface TreeSimpleFile {
  name: string;
  path: string;
}

interface TreeDir extends TreeSimpleFile {
  childrens: Tree[];
}

interface TreeMetadata extends TreeSimpleFile {
  metadata: Record<string, any>;
  content: string;
}

type Tree = TreeSimpleFile | TreeDir | TreeMetadata;
```

Ahora modificamos la función que crea nuestro árbol, para que en el caso de que no sea un directorio y sea un archivo con metadata podemos crear la estructura correcta.

```ts
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
          metadata: data.data,
          content: data.content,
        });
      }
    }
  }
  return node;
}
```

Y en la función que nos ejecuta los templates utilizamos los nuevos datos.

```ts
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
      template({ content, ...tree.metadatad}),
    );
  } else {
    Deno.copyFileSync(tree.path, `${path}/${tree.name}`);
  }
}
```

Con ese último cambio, solo tenemos que modificar los templates para que utilicen toda la metadata que añadamos a nuestras páginas en Obsidian. La guía oficial de Obsidian explica en detalle como hacerlo [link](https://notes.nicolevanderhoeven.com/obsidian-playbook/Using+Obsidian/03+Linking+and+organizing/YAML+Frontmatter)).

Ahora, nuestro Static Site Generator cuenta con todas las funcionalidades que ofrecen otros generadores del mercado. Tenemos **optimización SEO, creación de posts en Markdown y vista previa de enlaces**, con la ventaja de que si queremos añadir cualquier otra funcionalidad tenemos el conocimiento para realizarlo. 

Una buena tarea sería aplicar un template distinto según la metadata de cada página. En mi caso eso escapa de lo que me propuse inicialmente.

El objetivo de añadir git submodules para publicar otros repositorios va a quedar pendiente para el futuro. 

Por ahora, estoy contento con el pequeño proyecto que realizamos y espero que hayan aprendido algo. Cualquier duda o sugerencia los [issues de GitHub](https://github.com/nicolas-sabbatini/nicolas-sabbatini.github.io/issues) están disponibles.

**PD**: Voy a publicar otro post con algunos cambios extras los cuales mejoran la developer experience al modificar los templates y el contenido de nuestra Web.
