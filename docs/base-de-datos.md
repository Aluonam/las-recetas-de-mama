# La base de datos

Qué hace cada archivo SQL, en qué orden van y por qué están escritos así.

Para el paso a paso de la instalación, ver
[puesta-en-marcha.md](puesta-en-marcha.md). Esto explica el **porqué**.

---

## Los archivos, en orden

| Orden | Archivo | Qué deja hecho |
| ----- | ------- | -------------- |
| 1 | [`schema.sql`](../supabase/schema.sql) | Tablas, índices, permisos, protección por filas y el almacén |
| 2 | [`migraciones/004-varios-recetarios.sql`](../supabase/migraciones/004-varios-recetarios.sql) | Un recetario por familia, con código para entrar |
| 3 | [`migraciones/005-codigo-a-medida.sql`](../supabase/migraciones/005-codigo-a-medida.sql) | El código se puede elegir en vez de generarlo |
| 4 | [`migraciones/006-almacen-privado.sql`](../supabase/migraciones/006-almacen-privado.sql) | Las fotos dejan de tener direcciones permanentes |
| — | [`comprobar.sql`](../supabase/comprobar.sql) | No cambia nada: dice hasta dónde llegas |
| — | [`migraciones/001-renombrar-ocasiones.sql`](../supabase/migraciones/001-renombrar-ocasiones.sql) | Solo si ya había recetas antes del cambio de nombres |

**El orden no es decorativo.** El 005 sustituye una función que crea el
004. Pasarlos salteados deja la base a medias **sin dar ningún error**, que
es la peor forma de fallar. Por eso existe `comprobar.sql`.

### Los que ya no se usan

El **002** y el **003** son el modelo anterior: un solo recetario y una
lista de correos que se editaba a mano con SQL. El 004 los sustituyó.

Se quedan en el repositorio para poder consultar de dónde viene algo, pero
**no hay que ejecutarlos**. El 003 en particular, pasado después del 004,
reescribiría las reglas de las fotos con el modelo viejo y desharía la
separación entre familias. Por eso su parte útil —cerrar el almacén— vive
ahora en el 006, que no toca ninguna regla y se puede pasar cuando sea.

---

## Qué hace `schema.sql`, por bloques

1. **Las tablas.** `receta` y `variante`.
2. **Los índices.** Uno para buscar por ocasión y otro para buscar por
   título o por quién la hacía. Sin ellos todo funciona igual hasta que
   hay muchas recetas; con ellos sigue siendo instantáneo después.
3. **Un disparador.** Pone al día la fecha de última modificación en cada
   edición, para que la app no tenga que acordarse de hacerlo.
4. **Los permisos.** Quién puede asomarse a cada tabla.
5. **La protección por filas y sus políticas.** Qué filas ve quien se
   asoma.
6. **El almacén.** El sitio donde viven las fotos y los audios, con sus
   propias reglas.

---

## Permiso y política no son lo mismo

Es la distinción que cuesta más de PostgreSQL y la que permite que esta
web no necesite servidor propio.

| | Qué pregunta | Se escribe con |
| --- | ------------ | -------------- |
| **Permiso** | ¿Puedes **asomarte** a esta tabla? | `grant` / `revoke` |
| **Política** | Ya que te asomas, **¿qué filas** ves? | `create policy` (RLS) |

Son dos cerraduras en serie:

- Sin permiso no llegas ni a la puerta.
- Con permiso pero sin política que te ampare, llegas y ves **una lista
  vacía**. No un error: vacío. Es como se comporta la protección por filas.

Los tres roles que importan:

| Rol | Quién es | Qué puede |
| --- | -------- | --------- |
| `anon` | Ha abierto la web pero **no ha entrado** | Nada |
| `authenticated` | **Ha entrado** con su enlace del correo | Todo, **si está invitado** |
| `service_role` | Poder absoluto | Nunca sale de Supabase |

**Y todo esto vive dentro de la base, no en la web.** Por eso da igual que
la clave `anon` sea pública y se vea en el navegador: aunque alguien la
copie y escriba su propio programa, PostgreSQL le devuelve vacío.

---

## Por qué hay tantos `drop ... if exists`

Supabase avisa de que la consulta contiene «operaciones destructivas». El
aviso salta por la palabra `drop`, sin mirar qué va detrás.

Lo que hay detrás son once líneas, y **todas** son `drop policy if exists`
o `drop trigger if exists`. No hay ni un `drop table`, ni un `truncate`,
ni un `delete from`. **Nada que borre datos.**

Están para que el archivo se pueda **volver a ejecutar**. Si mañana hay que
retocar una regla, se cambia el archivo y se pasa entero: quita la vieja y
pone la nueva. Sin esas líneas, la segunda ejecución se pararía con «esa
regla ya existe» y habría que ir borrando a mano.

En un proyecto recién creado no borran nada, porque no existe ninguna de
esas reglas todavía.

---

## Por qué el cuerpo de la receta va en JSONB

Ingredientes, materiales, pasos y trucos no son cuatro tablas: son cuatro
columnas `jsonb` dentro de `receta`.

El criterio es **cómo cambian los datos**, no cómo quedan en un diagrama.
Esas cuatro listas se escriben y se guardan siempre juntas, en la misma
pantalla y por la misma persona. Normalizarlas costaría cuatro joins en
cada lectura y una transacción en cada guardado, a cambio de nada.

Las variantes sí son tabla propia, y por el mismo criterio: **las escribe
otra persona, en otro momento, sobre una receta que ya existe**.

Si algún día hace falta buscar por ingrediente, PostgreSQL indexa JSONB con
GIN sin migrar nada.

---

## Cómo se entra a un recetario

Cada familia tiene el suyo, con un código que hace de llave. No hay
invitaciones que aprobar ni correos que enviar: el código se pasa por
WhatsApp y quien lo escriba entra.

| Función | Qué hace |
| ------- | -------- |
| `crear_recetario(nombre, codigo)` | Crea el recetario y te hace miembro. Sin código, genera uno. |
| `unirse_con_codigo(codigo)` | Comprueba el código y te da de alta |
| `establecer_codigo(id, codigo)` | Pone el que se le diga |
| `cambiar_codigo(id)` | Genera uno al azar |
| `mis_recetarios()` | A qué recetarios perteneces. La usan todas las políticas. |

Son funciones de la base y no consultas sueltas porque cada una son varios
pasos que tienen que ocurrir juntos o no ocurrir: crear un recetario
implica además hacerse miembro, y entrar con un código implica comprobarlo
y darse de alta. Dejarlo en manos del navegador sería confiar en que nadie
interrumpe a mitad.

Detalles que parecen menores y no lo son:

- **Un código equivocado da siempre el mismo mensaje.** Si dijera «ese
  recetario no existe» frente a «ese código no es el tuyo», cualquiera
  podría ir probando para averiguar cuáles existen.
- **Se guarda en mayúsculas y se compara igual**, sin espacios. Llega
  copiado de un WhatsApp y nadie lo pega limpio.
- **Sin acentos ni eñes.** Se dicta por teléfono y se teclea en una tablet:
  todo lo que se pueda escribir de dos maneras acaba en «pues a mí no me
  entra».
- **Cambiar el código no echa a nadie.** Ser miembro está en `miembro`, no
  en saberse la llave.
- **Las fotos se guardan en una carpeta por recetario**, y las reglas la
  miran. Sin eso, adivinar una ruta bastaría para colarse en el álbum de
  otra casa.

### Lo que esto NO protege

El código es lo único que separa un recetario del resto de internet, y no
hay límite de intentos. Un código corto y adivinable —una palabra suelta,
un nombre— se puede encontrar probando. Por eso la app avisa cuando el
elegido no lleva ningún número.

Si algún día esto creciera, lo siguiente sería limitar los intentos por
usuario y hora.
