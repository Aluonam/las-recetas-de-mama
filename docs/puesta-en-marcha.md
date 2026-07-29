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
2. **New project**. Ponle el nombre que quieras.
3. **Región: Frankfurt (eu-central-1)** si estás en España. Es la más
   cercana y se nota al cargar las fotos.
4. Guarda la contraseña de la base de datos que te genere. No la usa la
   app, pero la necesitarás si algún día haces copias de seguridad.

> **Aviso del plan gratuito:** Supabase pausa los proyectos que pasan
> varios días sin actividad. Se reactivan desde el panel en un par de
> minutos, pero si el recetario se usa a temporadas, cuenta con ello.

---

## 2. Crear las tablas

En el panel, **SQL Editor** → **New query**:

1. Pega el contenido de [`supabase/schema.sql`](../supabase/schema.sql) y
   pulsa **Run**. Crea las tablas, la seguridad por filas y el almacén de
   fotos.
2. Repite con
   [`supabase/migraciones/002-lista-de-invitados.sql`](../supabase/migraciones/002-lista-de-invitados.sql),
   **cambiando antes los correos del final por los de verdad**.

El paso 2 no es opcional. Sin él, cualquiera que se registre en tu web
entra al recetario de tu familia. Con él, además de tener sesión hay que
estar en la lista.

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

## Copias de seguridad

Son recetas de familia: si se pierden, no se recuperan.

Supabase hace copias automáticas en el plan de pago, **no en el gratuito**.
Vale la pena descargar un volcado de vez en cuando desde
*Database → Backups*, o con `pg_dump` usando la contraseña del paso 1.
