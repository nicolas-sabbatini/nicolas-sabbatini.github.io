# Creando mi propio Static Site Generator - 01

## Objetivo

Según el plan definido en el post 00 de la serie lo primero que tenemos que
conseguir es escanear toda nuestra bóveda de Obsidian para saber que archivos
tenemos en ella.

> [!warning]
> Tenemos que tener en cuenta que dentro de la bóveda se van a
> encontrar archivos que no queremos escanear como la carpeta `.git`

## Desarrollo

Lo primero que vamos a realizar es crear una carpeta con el nombre de
`publisher` en donde vamos a inicializar el proyecto de Deno.

```bash
mkdir publisher
cd publisher
deno init
```

Dentro de la carpeta vamos a encontrar los archivos:

- deno.js
- main.ts
- main_test.ts

Por ahora solo vamos a estar trabajando en `main.ts`, vamos a borrar todo el
contendido y vamos a empezar a crear nuestro publisher.

> [!info]
> Se puede borrar sin miedo el `main_test.ts`, a donde vamos no
> necesitamos tests.

La primera función que tenemos que tener en cuenta es
[Deno.readDirSync](https://docs.deno.com/api/deno/~/Deno.readDirSync), esta
función nos permite leer un directorio en nuestra computadora y todo su
contenido, si le pasamos como parámetro `".."` (Directorio padre), vamos a
obtener la lista de todos el contenido de la carpeta padre.

> Código:

```ts
for (const dirEntry of Deno.readDirSync("..")) {
  console.log(dirEntry.name);
}
```

> Output:

```
index.md
assets
publisher
.git
blog
.obsidian
```

En output tenemos multiples archivos/directorios que no queremos escanear, para
eso vamos a crear un filtro para todos esos archivos/directorios que no deseamos
escanear.

> Código:

```ts
const IGNORE = [
  "publisher",
  ".git",
  ".gitignore",
  ".obsidian",
];

for (const dirEntry of Deno.readDirSync("..")) {
  if (IGNORE.includes(dirEntry.name)) {
    continue;
  }
  console.log(dirEntry.name);
}
```

> Output:

```
index.md
assets
blog
```

Ya tenemos la la base del escaneo, leer un directorio e ignorar el contenido no
deseado. Ahora si tenemos un directorio dentro de otro deberíamos también poder
escanear los hijos del otro directorio.

La forma más sencilla de hacer esto es creando una función recursiva, para eso
introducimos nuestro bucle en una función y si lo que leímos es de tipo
directorio volvemos a llamar la función sobre él.

> Código

```ts
function scanDirs(path: string) {
  for (const dirEntry of Deno.readDirSync(path)) {
    if (IGNORE.includes(dirEntry.name)) {
      continue;
    }
    console.log(dirEntry.name);
    if (dirEntry.isDirectory && !dirEntry.isSymlink) {
      scanDirs(`${path}/${dirEntry.name}`);
    }
  }
}
scanDirs("..");
```

> Output:

```
index.md
blog
index.md
creando_mi_propio_static_site_generator-01.md
creando_mi_propio_static_site_generator-00.md
```

Con eso ya nuestra función de escaneo esta casi completa, lo que necesitamos
ahora es que en vez de imprimir los directorios y archivos, deberíamos crear un
árbol con los datos de nuestra bóveda.

Para eso creamos la siguiente estructura de datos:

```ts
interface Tree {
  name: string;
  path: string;
  childrens: Tree[];
}
```

Posteriormente tenemos que modificar la función de escaneo de directorios para
retorne este objeto.

> Código:

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
      node.childrens!.push({
        name: dirEntry.name,
        path: `${path}/${dirEntry.name}`,
      });
    }
  }
  return node;
}
console.log(scanDirs("..", "boveda"));
```

> Output:

```json
{
  "name": "boveda",
  "path": "..",
  "childrens": [
    { "name": "index.md", "path": "../index.md" },
    {
      "name": "blog",
      "path": "../blog",
      "childrens": [
        { "name": "index.md", "path": "../blog/index.md" },
        {
          "name": "creando_mi_propio_static_site_generator-01.md",
          "path": "../blog/creando_mi_propio_static_site_generator-01.md"
        },
        {
          "name": "creando_mi_propio_static_site_generator-00.md",
          "path": "../blog/creando_mi_propio_static_site_generator-00.md"
        }
      ]
    }
  ]
}
```

Con eso ya terminamos toda la función de escaneo de nuestro programa, podemos
borrar todos los `console.log` de el y comenzar a pensar en la siguiente parte
que es convertir nuestros post en archivos HTML.

