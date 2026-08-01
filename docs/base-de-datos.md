# La base de datos

Qué hay dentro, por qué está así, y qué archivo hace cada cosa.

Para instalarla paso a paso, ver [puesta-en-marcha.md](puesta-en-marcha.md).
Esto explica el **porqué**.

---

## El modelo

| Tabla | Qué guarda |
| ----- | ---------- |
| `familia` | Un recetario: nombre, código de acceso y quién lo creó |
| `miembro` | Quién pertenece a cada recetario, y con qué correo se presentó |
| `receta` | La receta entera, incluido su `familia_id` |
| `variante` | «La versión de mamá, con menos nuez moscada» |

Y un almacén de archivos donde las fotos y los audios van en **una carpeta
por recetario**.

---

## Los archivos SQL

Se ejecutan **en orden**. Cada uno explica en su cabecera qué hace y por
qué.

| Orden | Archivo | Qué deja hecho |
| ----- | ------- | -------------- |
| 1 | `schema.sql` | Tablas, índices, permisos y el almacén |
| 2 | `004-varios-recetarios.sql` | Un recetario por familia, con código |
| 3 | `005-codigo-a-medida.sql` | El código se puede elegir |
| 4 | `006-almacen-privado.sql` | Fotos y audios sin direcciones permanentes |
| 5 | `007-mensajes-en-condiciones.sql` | Mensajes con tildes; arregla una ambigüedad de SQL |
| 6 | `008-entrar-sin-correo.sql` | Sesiones anónimas: se entra solo con el código |
| 7 | `009-solo-borra-quien-creo-el-recetario.sql` | Borrar, solo quien manda |
| 8 | `010-escribir-a-quien-administra.sql` | Poder avisar a quien administra |
| 9 | `011-usuario-jefe.sql` | Consultar y traspasar el mando |
| 10 | `012-solo-el-jefe-cambia-el-codigo.sql` | Cambiar el código, solo quien manda |
| 11 | `014-audios-por-apartado.sql` | Notas de voz pegadas a cada apartado de la receta |

**Sueltos, solo si hacen falta:**

- `013-recuperar-el-mando.sql` — cuando un recetario se creó desde una
  sesión anónima que se perdió y ya nadie puede borrar en él.
- `001-renombrar-ocasiones.sql` — si había recetas escritas antes de que
  cambiaran los nombres de las ocasiones.
- `comprobar.sql` — no cambia nada: dice hasta dónde llega la instalación.
- `limpiar-pruebas.sql` — quita los recetarios que crea el test.

### Los que ya no se usan

El **002** y el **003** son del modelo anterior: un solo recetario y una
lista de correos editada a mano. El 004 los sustituyó.

Se quedan para poder consultar de dónde viene algo, pero **no hay que
ejecutarlos**. El 003 en particular, pasado después del 004, reescribiría
las reglas de las fotos con el modelo viejo y desharía la separación entre
familias.

---

## Cómo se entra

No hay contraseñas ni enlaces al correo. Al abrir la web se crea una
**sesión anónima** en silencio, y la llave es el **código familiar**, que
se comparte por WhatsApp.

El correo se pide, pero solo queda anotado para saber quién escribió cada
receta. **No identifica a nadie**: cualquiera puede escribir el que
quiera.

| Función | Qué hace |
| ------- | -------- |
| `crear_recetario(nombre, codigo, correo)` | Crea el recetario y te hace miembro |
| `unirse_con_codigo(codigo, correo)` | Comprueba el código y te da de alta |
| `establecer_codigo(id, codigo)` | Pone el que se le diga |
| `cambiar_codigo(id)` | Genera uno al azar |
| `mis_recetarios()` | A cuáles perteneces. La usan todas las políticas |
| `soy_jefe(id)` | Si mandas ahí. La app decide con esto si enseña el botón de borrar |
| `traspasar_mando(id, correo)` | Deja el mando a otro miembro |
| `administrador_del_recetario(id)` | El correo de quien manda, para poder escribirle |

Son funciones de la base y no consultas sueltas porque cada una son varios
pasos que tienen que ocurrir juntos: crear un recetario implica además
hacerse miembro, y entrar con un código implica comprobarlo y darse de
alta.

Detalles que parecen menores y no lo son:

- **Un código equivocado da siempre el mismo mensaje.** Si distinguiera
  entre «no existe» y «no es el tuyo», se podrían probar códigos para
  averiguar cuáles existen.
- **Se guarda en mayúsculas y sin espacios.** Llega copiado de un WhatsApp
  y nadie lo pega limpio.
- **Sin acentos ni eñes.** Se dicta por teléfono y se teclea en una
  tablet.
- **Cambiar el código no echa a nadie.** Ser miembro está en `miembro`, no
  en saberse la llave.

---

## Quién puede qué

| | Ver | Añadir | Editar | Borrar | Cambiar el código |
| --- | --- | --- | --- | --- | --- |
| **Quien creó el recetario** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **El resto de la familia** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Quien no está dentro** | ❌ | ❌ | ❌ | ❌ | ❌ |

Borrar es solo de quien creó el recetario porque **una receta borrada por
error no se recupera**, y el valor de esto está en que nada se pierda.

Quien administra puede borrar **cualquier** receta, no solo las suyas.

Todas estas reglas viven en las políticas de PostgreSQL, no en la
interfaz. La app esconde los botones que no van a funcionar, pero eso es
cortesía: **esconder un botón no impide nada** a quien sepa escribir una
petición a mano.

---

## Quién manda, y por qué puede perderse

Quien crea un recetario queda anotado en `familia.creada_por`. Si esa
sesión era anónima y se pierde —al salir, al borrar el historial, al abrir
la app en otro dispositivo— el mando queda en una cuenta a la que ya no se
puede volver: sigues viendo y editando, pero no puedes borrar.

Por eso quien administra debería **verificar su cuenta con un correo**
desde Ajustes. Se usa `updateUser` sobre la sesión anónima, que le añade
correo **sin cambiar de identidad**: es la misma cuenta, así que el
recetario sigue siendo suyo y no hay que traspasar nada.

Si el mando ya se perdió, `013-recuperar-el-mando.sql` lo devuelve.

---

## Permiso y política no son lo mismo

Es la distinción que más cuesta de PostgreSQL y la que permite que esta
web no necesite servidor propio.

| | Qué pregunta | Se escribe con |
| --- | ------------ | -------------- |
| **Permiso** | ¿Puedes **asomarte** a esta tabla? | `grant` / `revoke` |
| **Política** | Ya que te asomas, **¿qué filas** ves? | `create policy` (RLS) |

Son dos cerraduras en serie. Sin permiso no llegas a la puerta; con
permiso pero sin política que te ampare, ves **una lista vacía** — no un
error.

| Rol | Quién es | Qué puede |
| --- | -------- | --------- |
| `anon` | Ha abierto la web pero no tiene sesión | Nada |
| `authenticated` | Tiene sesión, aunque sea anónima | Lo de sus recetarios |
| `service_role` | Poder absoluto | Nunca sale de Supabase |

**Y todo esto vive dentro de la base.** Por eso da igual que la clave
`anon` sea pública: aunque alguien la copie y escriba su propio programa,
PostgreSQL le devuelve vacío.

---

## Por qué el cuerpo de la receta va en JSONB

Ingredientes, materiales, pasos y trucos no son cuatro tablas: son cuatro
columnas `jsonb` dentro de `receta`.

El criterio es **cómo cambian los datos**. Esas cuatro listas se escriben
y se guardan siempre juntas, en la misma pantalla y por la misma persona.
Normalizarlas costaría cuatro joins en cada lectura y una transacción en
cada guardado, a cambio de nada.

Las variantes sí son tabla propia, y por el mismo criterio: **las escribe
otra persona, en otro momento**, sobre una receta que ya existe.

Si algún día hace falta buscar por ingrediente, PostgreSQL indexa JSONB
con GIN sin migrar nada.

---

## Un filtro que la base no puede poner por ti

Las políticas dejan ver las recetas de **todos** los recetarios a los que
perteneces. Eso es correcto: son tuyas.

Pero quien está mirando el de la yaya no quiere ver mezcladas las de su
madre, y la base no puede adivinar cuál tienes abierto. **El filtro por
`familia_id` tiene que ponerlo la aplicación en cada consulta.**

Costó un rato descubrirlo, así que está comprobado en el test.

---

## SEGURIDAD

Conviene decir hasta dónde llega y hasta dónde no, porque un proyecto que
promete más de lo que da es peor que uno modesto y honesto.

### Qué se protege

| Capa | Qué impide |
| ---- | ---------- |
| `mis_recetarios()` en las políticas | Ver un recetario que no es tuyo. Ni su nombre |
| Permisos por rol | Que `anon`, sin sesión, se asome a nada |
| Carpeta por recetario en el almacén | Que adivinar una ruta te meta en el álbum de otra casa |
| Almacén privado con enlaces firmados | Que una dirección de foto reenviada siga sirviendo. Caducan en una hora |
| `creada_por` en las políticas de borrado | Que alguien haga desaparecer recetas que no son suyas |

### Qué NO se protege, a propósito

**No hay límite de intentos al probar códigos.** Un código corto o
adivinable caería probando. Por eso la app avisa cuando el elegido no
lleva ningún número, pero no lo impide.

**El correo no está verificado** salvo el de quien administra. Cualquiera
puede escribir el que quiera al entrar.

**No hay registro de quién ha visto qué**, ni avisos de accesos raros, ni
verificación en dos pasos.

### Por qué está bien así

Esto es **el recetario de una familia**. Dentro hay croquetas, fotos de
una comida y la voz de una abuela contando cómo se hacía el arroz. No hay
dinero, ni datos de salud, ni documentos de identidad.

El peor caso realista de un fallo aquí es que un desconocido lea recetas
de croquetas. Eso no justifica límites de intentos, auditorías ni doble
factor: cada una de esas capas se paga en complicación, y **la
complicación se paga en que la abuela no sepa entrar**.

### Cuándo habría que subir el listón

Si esto dejara de ser familiar y entrara gente desconocida:

1. Limitar los intentos de `unirse_con_codigo` por usuario y hora.
2. Caducidad o un solo uso en los códigos.
3. Registro de accesos.
4. Copias automáticas, que hoy dependen de que alguien pulse el botón.

---

## Comprobarlo, no creérselo

Las reglas viven en PostgreSQL, así que la única forma honesta de saber
que hacen lo que dicen es preguntárselo a la base de verdad:

```bash
node scripts/prueba-permisos.mjs
```

Abre tres sesiones —quien creó el recetario, un familiar y un
desconocido— y comprueba quince cosas. Tarda unos segundos.

**Merece la pena ejecutarlo cada vez que se toquen permisos.** Ya destapó
una migración que se daba por aplicada y nunca se había ejecutado, y el
filtro por recetario que faltaba.

Deja creado un recetario de prueba cada vez; `limpiar-pruebas.sql` los
quita.
