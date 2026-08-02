# Arquitectura

Notas para quien vuelva a este código dentro de seis meses (probablemente
tú). Explica el **porqué**; el **qué** ya está en los comentarios del
código.

---

## 1. Capas

```
Páginas          →  cargan datos y colocan secciones
Componentes      →  saben pintarse, no saben de dónde vienen los datos
api.ts           →  única frontera con la base de datos
nucleo/supabase  →  única dependencia del proveedor
```

La regla que ordena todo: **una pantalla nunca importa `supabase`**. Habla
con el `api.ts` de su funcionalidad. Si mañana hay que migrar a otro
proveedor, se reescriben los `api.ts` y ninguna vista se entera.

Eso no es teoría: el modo demostración —recetas de ejemplo guardadas en
el navegador, sin servidor— se metió entero cambiando solo `api.ts`.

## 2. Por qué carpetas por funcionalidad

La alternativa habitual es agrupar por tipo (`components/`, `hooks/`,
`services/`). Se lee bien cuando el proyecto es pequeño y se rompe cuando
crece: tocar «variantes» te obliga a saltar entre cuatro carpetas.

Aquí, `src/variantes/` contiene sus tipos, su acceso a datos y su
interfaz. Se borra la carpeta y desaparece la funcionalidad entera.

`src/ui/` es la excepción a propósito: son piezas sin dominio (un campo,
una lista, un diálogo de confirmar) que no pertenecen a nada.

## 3. Por qué JSONB para el cuerpo de la receta

Ingredientes, materiales, pasos, trucos y las notas de voz van en
columnas `jsonb`, no en cinco tablas relacionadas.

El criterio es **cómo cambian los datos**, no cómo se dibujan en un
diagrama. Estas listas se escriben y se guardan siempre juntas, en la
misma pantalla, por la misma persona. Nadie edita «el ingrediente 3» por
su cuenta. Normalizarlas costaría varios joins en cada lectura y una
transacción en cada guardado, a cambio de nada.

Las variantes sí son tabla propia, y por el mismo criterio: **las escribe
otra persona, en otro momento, sobre una receta que ya existe**.

Si algún día hace falta buscar por ingrediente, PostgreSQL indexa JSONB
con GIN sin migrar nada.

## 4. Por qué `cantidadCasera` existe

Es la decisión de producto más importante del modelo.

Las recetas familiares no vienen en gramos. Vienen en «un puñado», «un
vaso de los del vino», «harina la que admita», «hasta que la masa te pida
más». Obligar a convertirlo a gramos no digitaliza la receta: la
sustituye por otra.

Por eso `cantidad`/`unidad` y `cantidadCasera` conviven, las dos
opcionales. `textoCantidad()` decide cómo se lee: si hay medida casera
manda ella, y la exacta queda entre paréntesis para quien quiera pesar.

El desplegable de medidas incluye a propósito «puñado», «pizca»,
«chorro», «al gusto» y «la que admita»: son medidas de verdad en una
cocina de casa, y ponerlas en la lista evita que la misma cosa acabe
escrita de tres maneras.

## 5. Tres maneras de meter una lista, y por qué no una sola

- **Filas** (`ui/ListaEditable.tsx`) donde cada elemento tiene partes
  distintas: los pasos, que llevan foto y audio propios.
- **Filas a medida** para los ingredientes: producto, medida y cantidad
  en la misma línea. Se probó a escribirlos de una tirada y se leía muy
  bien, pero había que adivinar dónde acaba el nombre y si lo de después
  es un número o «un puñado». Eso se equivoca.
- **Un cuadro de texto** (`ui/ListaEnTexto.tsx`) donde cada elemento es
  una frase suelta: los cacharros y los trucos. Ahí escribir seguido gana
  de calle a pulsar «añadir» doce veces.

La regla: **cuanto más estructura tiene un elemento, más justifica su
fila**. Una frase suelta no justifica nada.

## 6. Estado del formulario en un hook

`useFormularioReceta` carga, edita y guarda. Las pantallas solo colocan
campos.

Dos ventajas concretas: la lógica se prueba sin montar la interfaz, y
crear y editar comparten exactamente el mismo camino — sin `id` inserta,
con `id` actualiza, y no hay dos pantallas que se desincronicen.

Encima de ese hook hay **dos pantallas distintas a propósito**:

- **Asistente** para escribir una receta nueva. Quien empieza de cero no
  sabe cuántos campos hay ni cuáles importan, y veinte a la vez no se
  rellenan, se cierran.
- **Página larga** para editar una que ya existe. Si vienes a cambiarle
  el tiempo de horno a las torrijas, quieres ver la receta entera y tocar
  ese campo, no pasar por cinco pantallas buscándolo.

## 7. La red de seguridad al escribir

Escribir una receta lleva su rato, y todo eso vivía solo en la memoria de
la pestaña. El botón «atrás» del móvil o una llamada que descarga la
página se llevaban veinte minutos sin decir una palabra.

Tres redes, de la más fina a la más gruesa:

1. **Borrador** en el navegador (`editor/borrador.ts`), que se guarda
   solo y se ofrece al volver, por su nombre.
2. **Confirmar al cancelar**, que no tira nada: queda de borrador.
3. **Aviso del navegador** al cerrar, que es lo único que queda en una
   ventana privada donde no hay dónde guardar.

El borrador va en el navegador y no en el servidor a propósito: es un
papel a medias, y un papel a medias no se le enseña a la familia hasta
que quien lo escribe diga que ya está.

Al **editar** no hay borrador, solo aviso: la receta ya está a salvo, y
guardar un borrador encima plantearía una pregunta fea al volver —cuál
vale, ¿lo guardado o lo que dejaste a medias?

## 8. La voz: tres cosas distintas

No es un capricho tenerlas separadas. Son tres necesidades reales:

| Qué | Dónde | Para qué |
| --- | ----- | -------- |
| La receta entera contada | `audioUrl` | Quien se sienta y la cuenta de principio a fin |
| Notas por apartado | `audios[]` | El aviso suelto: «las manzanas, rectas por la base» |
| Un audio por paso | `pasos[].audioUrl` | Lo que escrito no se entiende: «hasta que la masa pida más» |

Y aparte, **dictar**, que no es lo mismo que ninguna de las tres:
convierte voz en letra y no guarda audio. El tono con el que se dice «sin
pasarse» no cabe escrito, así que dictar no sustituye a grabar.

El dictado lo hace el propio navegador, sin servidor ni clave de nadie.
Necesita internet e ir por `https` o `localhost`: **una dirección de red
local como `http://192.168.1.x` no vale**, porque los navegadores no dan
el micrófono fuera de un contexto seguro. Donde no está, el botón lo dice
y recuerda que la tecla del micrófono del teclado hace lo mismo.

## 9. El libro

Es la parte con más decisiones y la que más se ha rehecho.

**El libro es una pila de hojas, no de recetas.** Donde una letra tiene
varias, delante va su índice, como en los tomos antiguos (`libro/hojas.ts`).
Sin eso, llegar a las torrijas en una T con seis recetas era pasar hoja
seis veces mirando títulos.

**Una página o dos, según la forma de la pantalla y no según el ancho.**
Una tablet de pie es ancha de sobra en píxeles pero estrecha y alta de
forma, y ahí dos páginas salen apretadas e ilegibles. Un libro abierto es
apaisado: si la pantalla no lo es, se pasa cara a cara.

Ese criterio vive en **un solo sitio** —`.doble-pagina` en el CSS y
`DOS_PAGINAS` en `useDosPaginas.ts`, que dicen lo mismo—. Estuvo repartido
entre clases sueltas y una copia en JavaScript, y en cuanto se separaron
salía media hoja izquierda flotando en una tablet de pie.

**La hoja se pliega.** Va partida en tres tramos encajados uno dentro de
otro, colgando cada uno del anterior como una cadena de bisagras: los
ángulos se acumulan solos y el papel sale arqueado sin calcular nada.
Dos cosas que costaron: la perspectiva tiene que estar en el padre
**directo** de la hoja —en CSS no alcanza más allá—, y no se puede
oscurecer con `filter`, porque eso obliga al navegador a aplanar el 3D y
deja el giro sin volumen.

**Mientras gira, la página que aún no ha tapado sigue enseñando lo de
antes.** Si no, se lee la receta nueva antes de que nada se haya movido.

**Lo que no cabe se desplaza, y se avisa.** Se probó a repartir la receta
entre varios pliegos midiendo lo que ocupa cada bloque; funcionaba, pero
complicaba la navegación entera para un caso poco frecuente. Se volvió al
desplazamiento con tres avisos a la vez —el papel se difumina, una flecha
pulsable, y la barra pintada siempre— porque el fallo que había que
evitar no era la fealdad: era **quedarse sin quince pasos sin enterarse**.

## 10. Seguridad

Toda la protección está en **RLS de PostgreSQL**, no en el cliente. La
clave `anon` es pública por diseño y da igual que se vea en el navegador:
sin sesión válida, las políticas no devuelven ni una fila.

**Cada familia tiene su recetario**, y se entra con un código que se
comparte por WhatsApp. La sesión es anónima: sin cuentas, sin contraseñas
y sin esperar correos. Un recetario ajeno no existe para quien no es
miembro — no se ve ni su nombre.

Quien crea el recetario manda: es el único que borra recetas y cambia el
código. Para que eso sobreviva a un cambio de aparato, se ancla a un
correo verificado desde Ajustes.

La aplicación esconde los botones que no funcionarían, pero eso es
cortesía: esconder un botón no impide nada a quien sepa escribir una
petición a mano. Por eso existe `scripts/prueba-permisos.mjs`, que abre
tres sesiones distintas contra la base de verdad y comprueba quince
comportamientos. No simula nada, y ha pillado ya una migración que
dábamos por pasada y no lo estaba.

## 11. Accesibilidad

No es una capa de barniz: quien aporta el contenido tiene 70 u 80 años.

- Base de **18px**, no 16px.
- **Solo modo claro.** El oscuro se quitó: las cenefas son dibujos de
  porcelana con el fondo blanco dentro del SVG, y sobre negro quedaban
  flotando en recuadros claros.
- **Sin contraseñas**: se entra con el código de la familia.
- Foco siempre visible (`:focus-visible` con contorno de 3px).
- Objetivos táctiles cómodos en los controles pequeños.
- Etiquetas reales enlazadas por `id`, `aria-pressed` en los
  conmutadores, `role="status"` y `role="alert"` en los avisos.
- **Diálogos propios** en vez de los del sistema: sus botones dicen lo
  que hacen —«Sí, borrar «Croquetas»»— en vez de «Aceptar».
- **Estilos de impresión**: una receta en papel sale en negro sobre
  blanco, sin cenefas ni botones, y los ingredientes no se parten entre
  dos hojas.

## 12. Responsive

Tres contextos reales de uso, no tres breakpoints inventados:

| Dónde | Cuándo | Qué cambia |
| ----- | ------ | ---------- |
| Móvil | De pie, cocinando | Una columna, botones a lo ancho, barra pegada abajo |
| Tablet de pie | En la encimera | Libro de una cara, hoja a pantalla completa |
| Tablet apaisada | Apoyada, leyendo | Libro abierto de par en par, cabecera encogida |
| Portátil | Sentada, escribiendo | Rejilla de tarjetas configurable, formulario a dos columnas |

El modo cocina sube el texto a `1.35rem` y mantiene la pantalla encendida
con Wake Lock, volviendo a pedirlo al regresar a la pestaña.


