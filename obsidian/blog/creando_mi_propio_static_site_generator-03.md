---
anterior: creando_mi_propio_static_site_generator-02.html
descripcion: Una serie de tutoriales en la cual construimos un static site generator.
image: /assets/markdown-to-html.svg
parent: BLOG
parent_url: /blog
siguiente: creando_mi_propio_static_site_generator-04.html
tags:
  - tutorial
  - web
  - html
  - deno
titulo: Creando mi propio static site generator - 03
---

# Creando mi propio Static Site Generator - 03

## Que vamos a hacer

Ya tenemos el HTML de nuestros post ahora le tenemos que dar vida con un poco de CSS y un template para que todos tengan la misma estructura.

## Desarrollo

Para utilizar los templates vamos a instalar [Handlebars.js](https://handlebarsjs.com) que es un template engine mínimo en nuestro proyecto de Deno corriendo el siguiente comando.

```bash
deno install npm:handlebars
```

Y luego lo importamos en nuestro `main.ts`.

```ts
import Handlebars from "handlebars";
```

Creamos una carpeta donde vamos a guardar los templates dentro de nuestro proyecto de Deno y creamos un template simple.

```html
<html lang="es-AR">
  <head>
    <!--Meta data de render-->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!--Título de la página-->
    <title>Mi blog</title>

    <!--SEO-->
    <meta name="description" content="Este es mi blog">
    <meta name="keywords" content="HTML, CSS, JavaScript, TypeScript, tutorial">
    <meta name="author" content="Mi nimbre">
    <meta name="robots" content="index, follow">

    <!--Favicon-->
    <link rel="icon" type="image/png" href="favicon.png">

    <!--Tarjetas para redes sociales-->
    <meta property="og:title" content="Título para compartir en redes">
    <meta property="og:description" content="Descripción en redes">
    <meta property="og:image" content="https://ejemplo.com/imagen.jpg">
    <meta property="og:url" content="https://ejemplo.com">
    <meta name="twitter:card" content="summary_large_image">

    <!--Estilos-->
    <link rel="stylesheet" href="styles.css">

    <!--Fuentes-->
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
      rel="stylesheet"
    >

    <!--Scrips-->
    <script src="script.js" defer></script>
  </head>
  <body>
    {{{content}}}
  </body>
</html>
```

> [!NOTE]
> Los headers de ese template son ejemplos y vas a tener que codificarlos según corresponda

Ahora al comienzo de nuestro programa cargamos el template.

```ts
const template = Handlebars.compile(
  Deno.readTextFileSync("./template/base.html"),
);
```

Y volvemos a modificar la función que crea los archivos, para que ejecute el template y con el resultado cree el archivo.

```ts
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
      template({ content }),
    );
  }
}
```

Con estos cambios ya completamos el MVP de nuestro blog, ahora solo queda escribir posts y publicar.
