# Creando mi propio Static Site Generator - 02

## Que vamos a hacer

Después de [escanear nuestra bóveda](creando_mi_propio_static_site_generator-01.md) y armar nuestro árbol con la información de la bóveda, tenemos que poder recorrer este árbol para poder replicar la estructura que posee en un directorio output (`dist`) en la cual pondremos los archivos ya transformados.

## Desarrollo

Lo primero que haremos sera borrar el directorio output en caso de que exista, así no tenderemos archivos viejos que nos generen problemas, para eso llamaremos la función [Deno.removeSync](https://docs.deno.com/api/deno/~/Deno.removeSync).

```ts
try {
  Deno.removeSync("../dist", { recursive: true });
} catch (err) {
  console.error(err);
}
```


> [!INFO]
> Como la función falla si este directorio no existe lo ponemos en un try catch.

Una vez borrada la carpeta vamos a crear otra función que en base a un árbol cree las carpetas correspondientes, utilizando la función [Deno.mkdirSync](https://docs.deno.com/api/deno/~/Deno.mkdirSync).

```ts
function createTreeOnFileSystem(tree: Tree, path: string) {
  if (tree.childrens) {
    Deno.mkdirSync(`${path}/${tree.name}`);
    for (const c of tree.childrens) {
      createTreeOnFileSystem(c, `${path}/${tree.name}`);
    }
    return;
  }
  // TODO en caso de que no sea directorio crear un
  // archivo con los datos correspondientes
}
const tree = scanDirs("..", "dist");
createTreeOnFileSystem(tree, "..");
```


> [!WARNING]
> No te olvides de añadir `dist` a la lista de IGNORE.

La función que creamos toma un Tree y un path a donde va a crear la estructura de datos, si el nodo es de typo directorio, lo sabemos porque tiene hijos, creamos la carpeta y volvemos a ejecutar la función sobre los hijos.

Al ahora de crear archivos tenemos 2 opciones que el archivo sea en formato `.md` los cuales queremos transformar en HTML o que sean de otro tipo, en ese caso los queremos pegar sin ninguna transformación.

Primero vamos a tomar el caso más fácil el de copiar el archivo para eso modificaremos la función creada previamente para que realice la copia en caso de que un archivo no termine en `.md`, esto lo vamos a realizar utilizando la función [Deno.copyFileSync](https://docs.deno.com/api/deno/~/Deno.copyFileSync).

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
  }
}
```

Una vez realizada la copia, nos toca leer el archivo `.md` y transformarlo en un archivo HTML, para eso vamos a instalar la librería [showdown](https://github.com/showdownjs/showdown), la cual va realizar toda la parte pesada por nosotros, para eso ejecutamos.

```bash
deno install npm:showdown npm:@types/showdown
```

Y en la parte superior de nuestro archivo main.ts importamos la libreria y creamos un objeto de typo `Converter` global con la configuración deseada.

```ts
import showdown from "showdown";

showdown.setFlavor("github");
const converter = new showdown.Converter({
  tables: true,
  simpleLineBreaks: true,
  strikethrough: true,
});
```

Ya con eso tenemos todo lo necesario para transformar nuestros archivo para ser publicados en la web, modificamos la función que crea los archivos para utilizar el convertidor y crear los archivos faltantes con la función [Deno.writeTextFileSync](https://docs.deno.com/api/deno/~/Deno.writeTextFileSync).

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
    const html = converter.makeHtml(mdFile);
    Deno.writeTextFileSync(
      `${path}/${tree.name.replace(".md", ".html")}`,
      html,
    );
  }
}
```

Con estos cambios ya tenemos un static site generator sencillo que parsea nuestros post escritos en obsidian y los transforma en una página web estática la cual podemos ver desde el navegador, en el siguiente post vamos a meter el output en un template para que quede más bonita y no sea solo un texto básico.