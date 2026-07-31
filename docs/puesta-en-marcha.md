# Poner el recetario en marcha

Guía para montarlo desde cero: base de datos, publicación en internet e
instalación en el móvil o la tablet.

Alrededor de media hora. No hace falta saber programar, pero sí seguir el
orden.

---

## Qué hace falta

| | Para qué | Coste |
| --- | -------- | ----- |
| [Supabase](https://supabase.com) | Los datos, las fotos y los audios | Gratis |
| [Vercel](https://vercel.com) | Publicar la web con HTTPS | Gratis |
| Cuenta de GitHub | Conectar las dos | Gratis |

**El orden importa: Supabase primero, publicar después.** Las claves se
incrustan al compilar, así que hacerlo al revés obliga a repetir.

---

## 1. Crear el proyecto en Supabase

**New project**, y rellena así:

| Campo | Qué poner |
| ----- | --------- |
| **Project name** | `las-recetas-de-mama` |
| **Database password** | *Generate a password*, y **guárdala en tu gestor**. No la usa la app, pero es la única forma de sacar un volcado completo, y no se recupera |
| **Region** | Una concreta de Europa: **Paris** o **Frankfurt** |
| **GitHub** | Sin conectar |

Y las tres casillas de **Security**:

| Casilla | Cómo | Por qué |
| ------- | ---- | ------- |
| Enable Data API | ✅ | Es por donde habla la app |
| Automatically expose new tables | ⬜ | Lo recomienda Supabase. El esquema concede los permisos tabla por tabla |
| Enable automatic RLS | ✅ | Red de seguridad para tablas futuras |

---

## 2. Activar las sesiones anónimas

**Authentication → Providers → Anonymous sign-ins → activar.**

Es lo que permite entrar sin correo. **Sin esto no entra nadie.**

---

## 3. Crear las tablas

**SQL Editor → New query**, y pega estos archivos **en este orden**,
uno detrás de otro:

1. `supabase/schema.sql`
2. `supabase/migraciones/004-varios-recetarios.sql`
3. `supabase/migraciones/005-codigo-a-medida.sql`
4. `supabase/migraciones/006-almacen-privado.sql`
5. `supabase/migraciones/007-mensajes-en-condiciones.sql`
6. `supabase/migraciones/008-entrar-sin-correo.sql`
7. `supabase/migraciones/009-solo-borra-quien-creo-el-recetario.sql`
8. `supabase/migraciones/010-escribir-a-quien-administra.sql`
9. `supabase/migraciones/011-usuario-jefe.sql`
10. `supabase/migraciones/012-solo-el-jefe-cambia-el-codigo.sql`

> **No ejecutes el 002 ni el 003.** Son del modelo anterior. El 003,
> pasado después del 004, desharía la separación entre familias.

Avisará de «operaciones destructivas». Son `drop policy`: reglas que se
sustituyen, no datos. No hay ningún `drop table` ni `delete`.

**Dos trampas al pegar:**

- Si queda **texto seleccionado**, el editor ejecuta solo la selección.
  Haz clic en cualquier sitio antes de pulsar Run.
- Si copias los archivos con PowerShell, **usa la codificación correcta** o
  las tildes llegarán rotas. Ver [la nota al final](#tildes-rotas).

### Comprobar

Pega `supabase/comprobar.sql` y **Run**. No cambia nada: dice hasta dónde
llega la instalación y si las fotos están privadas.

---

## 4. Copiar las claves

**Project Settings → API**:

| En Supabase | En el proyecto |
| ----------- | -------------- |
| *Project URL* | `VITE_SUPABASE_URL` |
| *anon · public* | `VITE_SUPABASE_ANON_KEY` |

Para probar en tu ordenador, copia `.env.example` a `.env.local` y
rellénalas. Si desaparece el aviso naranja de «Modo demostración», está
conectado.

> La clave `anon` es **pública por diseño** y se ve en el navegador. Quien
> protege los datos son las políticas, no la clave. La `service_role`
> **no debe salir nunca** de Supabase.

---

## 5. Publicar en Vercel

Hace falta para dos cosas: que la familia entre desde sus casas, y que la
app se pueda **instalar**. Los service workers solo funcionan con HTTPS.

1. Entra con tu cuenta de GitHub.
2. **Add New → Project** → importa el repositorio.
3. Detecta Vite solo. No toques la configuración de build.
4. **Antes de desplegar**, en *Environment Variables*, añade las dos del
   paso 4.
5. Deploy.

> Si se te olvidan las variables, la web sale en modo demostración y hay
> que volver a compilar. Y al pegar la clave, **comprueba que queda en una
> sola línea**: un salto de línea dentro hace que la app falle con un
> «Invalid value» que no dice nada.

---

## 6. Decirle a Supabase cuál es tu dirección

**Authentication → URL Configuration**:

- **Site URL**: la dirección de Vercel
- **Redirect URLs**: esa misma y `http://localhost:5173`, para seguir
  probando en tu ordenador

Sin esto, el enlace de verificación de la administradora no vuelve a la
app.

---

## 7. Crear tu recetario

Ya **no se hace con SQL**. Desde la web:

1. Ábrela. No pide contraseñas ni enlaces: entras directamente.
2. **Crear uno nuevo** → tu correo, el nombre y **la contraseña familiar**.
3. Ya dentro, **Ajustes** → el código en grande y **Copiar invitación**,
   que deja listo el mensaje para WhatsApp.

### Verifica tu cuenta

**Ajustes → «¿Administras este recetario?» → tu correo.**

Esto es importante y se olvida: sin verificar, tu condición de
administradora **vive solo en este navegador**. Si sales, borras el
historial o abres el recetario en la tablet, dejarás de poder borrar
recetas.

Al verificar es la misma cuenta, no una nueva: el recetario sigue siendo
tuyo.

### Sobre el código

- **Métele un número.** Una palabra suelta se adivina; `ROGELIO162` no.
- **Se puede cambiar** desde Ajustes. El viejo deja de servir y quien ya
  entró sigue dentro.
- Da igual mayúsculas, minúsculas o espacios: llega copiado de un WhatsApp.

---

## 8. Que entre la familia

Le pasas el mensaje por WhatsApp. Esa persona:

1. Abre la dirección
2. Escribe **su** correo y el código
3. Dentro

No necesita cuenta, ni contraseña, ni recibir ningún correo.

---

## 9. Instalar en el móvil o la tablet

- **Android:** sale el aviso *Tenlo a mano* → **Añadir a la pantalla de
  inicio**
- **iPad / iPhone:** Apple no permite el aviso automático. La app explica
  los tres pasos: **Compartir** → **Añadir a pantalla de inicio** →
  **Añadir**

Queda como un icono más, se abre sin barra del navegador y las recetas ya
vistas funcionan sin conexión.

---

## Que no se duerma

El plan gratuito de Supabase **pausa los proyectos** que pasan varios días
sin peticiones. Se pausa por inactividad, no por poco uso.

En el repositorio hay una tarea que lo evita:
[`.github/workflows/mantener-despierto.yml`](../.github/workflows/mantener-despierto.yml).
Para activarla, crea dos secretos en *Settings → Secrets and variables →
Actions* con los mismos valores del paso 4:

| Secreto | Valor |
| ------- | ----- |
| `SUPABASE_URL` | *Project URL* |
| `SUPABASE_ANON_KEY` | *anon · public* |

Lánzala una vez a mano desde **Actions** para comprobar que responde.

> **Ojo:** GitHub desactiva las tareas programadas en repositorios que
> pasan **60 días sin ningún commit**. Y ese es justo el escenario que
> importa aquí: dejar el proyecto quieto unos meses apagaría el
> despertador y detrás el servidor.

### El despertador principal: cron-job.org

Por eso conviene un segundo despertador que **no dependa de tocar el
repositorio**. En [cron-job.org](https://cron-job.org), gratis:

| Campo | Valor |
| ----- | ----- |
| **URL** | `https://TU-PROYECTO.supabase.co/auth/v1/health` |
| **Programación** | Cada día |
| **Encabezado** | Nombre `apikey`, valor la clave *anon* |

El encabezado va en la pestaña **Avanzado**, sección **Encabezados** →
*Añadir*. No es lo mismo que «Requiere autenticación HTTP», que se queda
apagado.

**Diario, no mensual.** Supabase pausa a los pocos días, no al mes: una
llamada mensual dejaría el proyecto dormido tres semanas de cada cuatro.

Con los dos montados —cron-job.org a diario y GitHub dos veces por
semana— tendrían que fallar ambos a la vez.

### No, no se puede desactivar en Supabase

No hay ningún ajuste: es política del plan gratuito, no una opción. Las
únicas alternativas son pagar el plan Pro (25 $/mes, los proyectos de pago
no se pausan) o alojarlo uno mismo.

Si aun así se duerme, **no se pierde nada**: se reactiva desde el panel en
un par de minutos, y la app lo dice con palabras claras en vez de con un
error técnico.

---

## Copias de seguridad

Supabase **no las hace** en el plan gratuito, y aquí el contenido es
irrecuperable si se pierde.

**Ajustes → Descargar copia de seguridad.** Genera un ZIP:

```
recetas-de-mama-2026-07-31.zip
├── recetas.json          Todo el texto, legible
├── LEEME.txt
├── croquetas-de-la-abuela-carmen/
│   ├── 8f3a....jpg       Las fotos
│   └── b21c....webm      El audio
└── arroz-con-leche/
```

Se abre con cualquier programa y **no necesita esta aplicación**. Es
además la garantía de no quedar atrapada en Supabase: los datos son tuyos
y salen en un formato que se lee dentro de veinte años.

Hazlo de vez en cuando y guárdalo en más de un sitio. **Es la única
protección que no depende de que ningún servicio siga existiendo.**

---

## Si algo no va

| Síntoma | Causa casi siempre |
| ------- | ------------------ |
| Sale el aviso naranja de demostración | Faltan las variables en Vercel, o no se recompiló |
| Pantalla en blanco tras desplegar | Caché de la PWA: Ctrl+Shift+R, o *Clear site data* |
| «No se ha podido abrir la sesión» | Faltan las sesiones anónimas (paso 2) |
| «Invalid value» al cargar | La clave tiene un salto de línea |
| «Vuelve a consultar tu código familiar» | Está mal escrito, o es de otra familia |
| Entra pero no aparece el botón de borrar | No eres quien creó ese recetario, o el mando quedó en una sesión anónima perdida: ver `013-recuperar-el-mando.sql` |
| Las recetas salen mezcladas entre recetarios | Versión antigua en caché: Ctrl+Shift+R |
| «Failed to fetch» | Proyecto pausado: reactívalo en el panel |

<a name="tildes-rotas"></a>

### Tildes rotas al pegar SQL

Si en la app aparece `cÃ³digo` en lugar de `código`, el archivo SQL llegó
mal copiado y quedó así guardado en la base.

PowerShell 5.1 lee los archivos UTF-8 sin BOM como si fueran ANSI. Para
copiarlos bien:

```powershell
$utf8 = New-Object System.Text.UTF8Encoding($false)
Set-Clipboard -Value ([System.IO.File]::ReadAllText('ruta\al\archivo.sql', $utf8))
```

`Get-Content -Raw` **no** vale. Y `Set-Content -Encoding utf8` añade un BOM
que hace fallar la primera línea del script.
