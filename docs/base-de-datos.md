# La base de datos

Qué hace cada archivo SQL, en qué orden van y por qué están escritos así.

Para el paso a paso de la instalación, ver
[puesta-en-marcha.md](puesta-en-marcha.md). Esto explica el **porqué**.

---

## Los archivos, en orden

| Orden | Archivo | Qué deja hecho |
| ----- | ------- | -------------- |
| 1 | [`schema.sql`](../supabase/schema.sql) | Tablas, índices, permisos, protección por filas y el almacén |
| 2 | [`migraciones/002-lista-de-invitados.sql`](../supabase/migraciones/002-lista-de-invitados.sql) | Entrar deja de bastar: hay que estar en la lista |
| 3 | [`migraciones/003-fotos-y-audios-privados.sql`](../supabase/migraciones/003-fotos-y-audios-privados.sql) | Las fotos dejan de tener direcciones permanentes |
| — | [`comprobar.sql`](../supabase/comprobar.sql) | No cambia nada: da un parte de si todo lo anterior está bien |
| — | [`migraciones/001-renombrar-ocasiones.sql`](../supabase/migraciones/001-renombrar-ocasiones.sql) | Solo si ya había recetas escritas antes del cambio de nombres |

**El orden no es decorativo.** El 002 reescribe políticas que crea el 001, y
el 003 depende de la función que crea el 002. Pasarlos salteados deja la
base a medias **sin dar ningún error**, que es la peor forma de fallar. Por
eso existe `comprobar.sql`.

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

## Si algún día sois más de una familia

El modelo actual es de **una sola familia**: quien está invitado ve todo.

Para pasar a varias:

1. Añadir `familia_id uuid` a `receta` y `variante`.
2. Crear `miembro (usuario_id, familia_id)`.
3. Cambiar `es_de_la_familia()` para que compare familias en vez de
   consultar la lista de invitados.

Nada del código de la aplicación cambia salvo el alta de familia. Es la
ventaja de que los permisos vivan en la base y no repartidos por las
pantallas.
