# Creando mi propio Static Site Generator - 00

## Porque crear otro `Static site Generator`

Hace ya varios años que quiero dejar mi trabajo como desarrollador web y abrir mi propio estudio de video juegos indies, pero tengo un problema. No puedo terminar ningún proyecto que me propongo, eso hace que no me anime a dar el salto.

Pero según el internet y muchas personas que soñaron con iniciar su propio camino como artista/emprendedor/freelancer hay una solución para el problema de la falta de compromiso, y esto es construir en público o en ingles `Building in Public`. Que es esa solución magical, es básicamente mostrar a todo el mundo todo el proceso que realizas para conseguir tu objetivo, esta forma de trabajar te fuerza a estar constantemente trabajando en algo ya que no querés decepcionar a las personas que están siguiendo tu trabajo y tu proceso creativo.

Problema, la mayoría de las personas que siguen este proceso tienden a ser muy activos en redes sociales y yo soy una persona muy introvertida que no se siente muy cómodo con las redes, si bien me gusta escrolear por ellas no me gusta realizar interacciones y me siento muy incomodo pasteando contendido. Solución crear mi propio espacio en internet en donde gritar solo y si a alguien le interesa lo que tengo que decir que venga y se siente.

Para crear este espacio hay un montón de herramientas increíbles, [NextJS](https://nextjs.org/), [HUGO](https://gohugo.io/), [Astro](https://astro.build/), incluso hay una web que las lista [jamstack](https://jamstack.org/generators/), pero ninguna me termino de cerrar por distintas razones.

No queriendo ser derrotado por no poder hacer algún tipo de blog de una manera que me hiciera sentir cómodo, decidí crear mi propio `static site generator` el cual si están leyendo esto fue un éxito.

## Cual es la idea

La idea básica que tengo planeada es crear un programa que tome una bóveda de [Obsidian.md](https://obsidian.md/) y la transforme en un sitio web estático que va a ser publicado en [GitHub](https://github.com/).

### Herramientas

- Deno: Para escanear la bóveda y para crear los archivos HTML
- Obsidian: Crear los post y paginas del blog

## Plan

- MVP
  1. Escanear toda la bóveda
  2. Renderizar las páginas como HTML
  3. Insertar el HTML en templates
- Parte 2
  1. Leer metadata de las páginas
  2. Añadir la metadata leída a los templates y otras paginas
- Parte 3
  1. Añadir git submodules para comenzar a añadir proyectos públicos
