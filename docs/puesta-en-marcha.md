# Poner el recetario en marcha

Guía para pasar del modo demostración a un recetario de verdad que la
familia comparta desde sus móviles y tablets.

Son unos 30 minutos. No hace falta saber programar, pero sí seguir el
orden: **Supabase primero, publicar después**. Las claves se incrustan al
compilar, así que publicar antes de tenerlas obliga a repetir.

---

## Qué cambia respecto a ahora

Hoy la app funciona en **modo demostración**: cada navegador guarda sus
recetas y no las comparte con nadie. Tu tablet y la de tu suegra serían
dos recetarios distintos.

Con Supabase hay una única base de datos y todos veis lo mismo, escriba
quien escriba.

---

## 1. Crear el proyecto en Supabase

1. Entra en [supabase.com](https://supabase.com) y crea una cuenta.
2. **New project**, y rellena así:

| Campo | Qué poner |
| ----- | --------- |
| **Project name** | `las-recetas-de-mama`. El nombre por defecto es «Tu nombre's Project» y dentro de un año no te dirá nada. |
| **Database password** | Genérala con *Generate a password* y **guárdala en tu gestor de contraseñas**. La app no la usa, pero es la única forma de sacar un volcado completo de la base, y no se puede recuperar. |
| **Region** | Despliega y elige una concreta de Europa: **Paris** o **Frankfurt** son las más cercanas a España. Dejarlo en el grupo «Europe» sin concretar no vale. |
| **GitHub** | Déjalo sin conectar. Sirve para que Supabase aplique cambios de esquema desde el repositorio; aquí el esquema se pega a mano y son cuatro archivos. |

3. En **Security**, tres casillas:

| Casilla | Cómo dejarla | Por qué |
| ------- | ------------ | ------- |
| **Enable Data API** | ✅ **Marcada** | Es por donde habla la app. Sin esto no funciona nada. |
| **Automatically expose new tables** | ⬜ **Desmarcada** | Lo recomienda el propio Supabase. El esquema concede los permisos tabla por tabla, así que no hace falta, y así una tabla que crees más adelante no queda expuesta por descuido. |
| **Enable automatic RLS** | ✅ **Márcala** | Red de seguridad: cualquier tabla nueva nace protegida. El esquema ya activa la protección en las suyas, así que esto solo cubre despistes futuros. |

> **Aviso del plan gratuito:** Supabase pausa los proyectos que pasan
> varios días sin actividad. Un recetario familiar se usa a temporadas, así
> que esto importa. Ver [Que no se duerma](#que-no-se-duerma).

---

## 2. Crear las tablas

En el panel, **SQL Editor** → **New query**:

1. Pega el contenido de [`supabase/schema.sql`](../supabase/schema.sql) y
   pulsa **Run**. Crea las tablas, la seguridad por filas y el almacén de
   fotos.
2. Repite con
   [`supabase/migraciones/002-lista-de-invitados.sql`](../supabase/migraciones/002-lista-de-invitados.sql),
   **cambiando antes los correos del final por los de verdad**.
3. Y con
   [`supabase/migraciones/003-fotos-y-audios-privados.sql`](../supabase/migraciones/003-fotos-y-audios-privados.sql).

Los pasos 2 y 3 no son opcionales:

- **Sin el 2**, cualquiera que se registre en tu web entra al recetario de
  tu familia. Con él, además de tener sesión hay que estar en la lista.
- **Sin el 3**, las fotos y los audios tienen direcciones permanentes: quien
  conozca una la ve sin cuenta, y esa dirección se puede reenviar. Con él
  no hay direcciones fijas; cada archivo se pide con la sesión abierta y el
  enlace caduca en una hora.

---

## 3. Copiar las claves

**Project Settings → API**. Necesitas dos valores:

| En Supabase | En el proyecto |
| ----------- | -------------- |
| *Project URL* | `VITE_SUPABASE_URL` |
| *anon · public* | `VITE_SUPABASE_ANON_KEY` |

Para probarlo en tu ordenador:

```bash
cp .env.example .env.local
```

Rellena los dos valores y arranca con `npm run dev`. Si desaparece el
aviso naranja de «Modo demostración», está conectado.

> La clave `anon` es **pública por diseño** y se ve en el navegador. No
> pasa nada: quien protege los datos son las políticas de la base, no la
> clave. La otra clave que verás, `service_role`, **no debe salir nunca**
> de Supabase.

---

## 4. Publicar la web

Hace falta para dos cosas: que la familia entre desde sus casas, y que la
app se pueda **instalar** en la tablet. Los service workers solo funcionan
con HTTPS, así que desde `localhost` o una IP local no hay instalación
posible.

Con [Vercel](https://vercel.com) o [Netlify](https://netlify.com), gratis:

1. Entra con tu cuenta de GitHub.
2. Importa el repositorio `Aluonam/las-recetas-de-mama`.
3. Detecta Vite solo. Comando `npm run build`, carpeta `dist`.
4. **Antes de desplegar**, añade las dos variables de entorno del paso 3.
   Si se te olvidan, la web se publica en modo demostración y hay que
   volver a compilar.
5. Deploy. Te dará una dirección tipo
   `las-recetas-de-mama.vercel.app`.

---

## 5. Decirle a Supabase cuál es tu dirección

Este paso se olvida siempre y **rompe el acceso de todo el mundo**: los
enlaces del correo llevarían a `localhost` y nadie podría entrar.

En **Authentication → URL Configuration**:

- **Site URL**: la dirección que te dio Vercel.
- **Redirect URLs**: añade esa misma dirección y, si quieres seguir
  probando en tu ordenador, también `http://localhost:5173`.

---

## 6. Cerrar el registro

En **Authentication**, en la configuración de acceso por correo, **desactiva
que cualquiera pueda registrarse** (la opción suele llamarse *Allow new
users to sign up*).

Es la segunda cerradura. La lista de invitados del paso 2 ya impide ver
las recetas a un desconocido; esto impide además que se cree la cuenta.

---

## 7. Invitar a la familia

Dos partes, y las dos hacen falta:

1. **En la base**: añade su correo a la lista de invitados.

   ```sql
   insert into public.invitado (correo, nombre)
   values ('correo-de-la-suegra@ejemplo.com', 'La suegra');
   ```

2. **En Supabase**: *Authentication → Users → Invite user*, con ese mismo
   correo.

Ella recibirá un correo, pinchará el enlace y entrará. Sin contraseñas.

A partir de ahí, **tú desde casa y ella desde su tablet veis exactamente
lo mismo**, y lo que escriba una lo ve la otra.

---

## 8. Instalar en la tablet

Con la web publicada:

- **Android:** al abrirla sale el aviso *Tenlo a mano* → **Añadir a la
  pantalla de inicio**.
- **iPad:** Apple no permite el aviso automático. La app explica los tres
  pasos: botón **Compartir** de Safari → **Añadir a pantalla de inicio** →
  **Añadir**.

Queda como un icono más. Se abre sin barra del navegador y las recetas ya
vistas funcionan sin conexión.

---

## Si algo no va

| Síntoma | Causa casi siempre |
| ------- | ------------------ |
| Sigue el aviso naranja de demostración | Faltan las variables en Vercel, o no se recompiló después de añadirlas |
| El enlace del correo lleva a `localhost` | Falta el paso 5 |
| Entra pero el recetario sale vacío | Su correo no está en la lista de invitados |
| No aparece la opción de instalar | No estás en HTTPS, o ya está instalada |
| «Failed to fetch» | Proyecto pausado por inactividad: reactívalo en el panel |

---

## Que no se duerma

El plan gratuito pausa los proyectos que pasan unos días sin recibir
ninguna petición. Se pausa por **inactividad**, no por poco uso: basta con
que algo consulte la base de vez en cuando.

En el repositorio hay una tarea que lo hace sola, dos veces por semana:
[`.github/workflows/mantener-despierto.yml`](../.github/workflows/mantener-despierto.yml).

Para activarla, crea dos secretos en GitHub —*Settings → Secrets and
variables → Actions*—, con los mismos valores del paso 3:

| Secreto | Valor |
| ------- | ----- |
| `SUPABASE_URL` | *Project URL* |
| `SUPABASE_ANON_KEY` | *anon · public* |

Luego, en la pestaña **Actions**, lánzala una vez a mano (*Run workflow*)
para comprobar que responde `200`. Si falla, GitHub te avisa por correo.

> **Ojo con una trampa de GitHub:** desactiva las tareas programadas en los
> repositorios que pasan **60 días sin ningún commit**. Avisa por correo
> antes de hacerlo. Si vas a tener el proyecto parado mucho tiempo, o
> prefieres no depender de esto, puedes hacer lo mismo gratis desde
> [cron-job.org](https://cron-job.org): una petición a
> `TU-URL/rest/v1/receta?select=id&limit=1` con la cabecera
> `apikey: TU-CLAVE-ANON`.

Si algún día se duerme igualmente, la app lo dice con palabras claras en
vez de con un error técnico, y se reactiva desde el panel de Supabase en
un par de minutos.

---

## Copias de seguridad

Son recetas de familia: si se pierden, no se recuperan. Y el plan gratuito
de Supabase **no hace copias**.

**Desde la propia app** hay un botón al final de la portada: *Descargar
copia de seguridad*. Genera un ZIP con todo dentro:

```
recetas-de-mama-2026-07-29.zip
├── recetas.json          Todas las recetas y variantes, en texto legible
├── LEEME.txt
├── croquetas-de-la-abuela-carmen/
│   ├── 8f3a....jpg       Las fotos
│   └── b21c....webm      El audio
└── arroz-con-leche/
```

Se abre con cualquier cosa y **no necesita esta aplicación para
entenderse**. Es también la garantía de que nunca te quedas atrapada: los
datos son tuyos y salen en un formato que se lee dentro de veinte años.

Hazlo de vez en cuando y guárdalo en más de un sitio. Un disco que se
estropea y una cuenta que se cierra pasan más de lo que parece.

Si además quieres la copia de la base entera, está en *Database → Backups*
o con `pg_dump` usando la contraseña del paso 1.
