---
anterior: creando_mi_propio_static_site_generator-04.html
descripcion: Una serie de tutoriales en la cual construimos un static site generator.
image: /assets/markdown-to-html.png
parent: BLOG
parent_url: /blog
siguiente: 
tags:
  - tutorial
  - web
  - html
  - deno
titulo: Creando mi propio static site generator - 05
---

# Creando mi propio Static Site Generator - 05

Este es un post extra hablando de algunas cosas que no estaban planeadas para crear el Static Site Generator, pero que mejoran la `developer experience`.

## Seleccionar URL base

Al probar los templates y estilos de forma local, es necesario que los headers de estilos apunten a una URL local. Sin embargo, en la versión final, deben apuntar a la URL de nuestra Web. 

Para evitar modificar manualmente el template según el entorno, añadí la opción de ejecutar el programa con un flag que determina si se debe usar la URL local o la de la Web.

```ts
// main.ts
const URL = [
  "http://127.0.0.1:8000", // URL local
  "https://nicolas-sabbatini.github.io", // WEB
];
let SELECTED_URL = 0; // Por defecto siempre se apunta a local
if (Deno.args[0] === "prod") {
  SELECTED_URL = 1;
}

/*
	Se omite mucho código
*/

// Cuando se ejecuta el template
template({ content, base_url: URL[SELECTED_URL] }),
```

```html
    <!--Template-->
    <link
      rel="stylesheet"
      href="{{base_url}}/assets/styles.css"
    >
```

## Hot Reloading

Al probar los templates y estilos de forma local era necesario volver a ejecutar el builder manualmente para ver las modificaciones en los archivos finales.  

Para evitar esto, creé una pequeña función que utiliza [Deno.watchFs](https://docs.deno.com/api/deno/~/Deno.watchFs) para detectar cambios en la bóveda, los templates y estilos, y reejecutar automáticamente el builder, asegurando que siempre tengamos disponible la version más reciente de nuestra Web.

```ts
buildWeb();
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
```
