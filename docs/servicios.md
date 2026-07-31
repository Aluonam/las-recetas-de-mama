# Los servicios que usa esta web

Dónde vive cada cosa, para qué sirve, cuánto cuesta y qué pasa si un día
falla.

Todos tienen plan gratuito y ninguno pide tarjeta.

---

## De un vistazo

| Servicio | Para qué | Panel | Coste |
| -------- | -------- | ----- | ----- |
| **GitHub** | El código y su historia | [repositorio](https://github.com/Aluonam/las-recetas-de-mama) | Gratis |
| **Vercel** | Publicar la web y las visitas | [vercel.com](https://vercel.com) | Gratis (Hobby) |
| **Supabase** | Recetas, fotos, audios y accesos | [supabase.com](https://supabase.com) | Gratis |
| **cron-job.org** | Que Supabase no se duerma | [cron-job.org](https://cron-job.org) | Gratis |

**La web:** [las-recetas-de-mama.vercel.app](https://las-recetas-de-mama.vercel.app)

---

## GitHub

El código, con el historial de por qué se tomó cada decisión.

El repositorio es **público** para que se pueda enseñar, y **sin
licencia**, lo que significa que se aplica el derecho de autor por
defecto: cualquiera puede leerlo, nadie puede reutilizarlo.

También aloja un **segundo despertador** de Supabase
(`.github/workflows/mantener-despierto.yml`), que corre lunes y jueves.
Necesita dos secretos, en *Settings → Secrets and variables → Actions*:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

> GitHub desactiva las tareas programadas en repositorios que pasan **60
> días sin commits**. Por eso este es el respaldo y no el principal.

---

## Vercel

Publica la web. Cada vez que se sube algo a `main`, compila y despliega
solo, en un par de minutos.

**No hay ningún servidor propio.** Son archivos servidos desde una red de
distribución: no hay sistema operativo que parchear ni nada persistente
que comprometer.

### Variables de entorno

En *Settings → Environment Variables*. Sin ellas la web arranca en modo
demostración:

| Nombre | De dónde sale |
| ------ | ------------- |
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → *Project URL* |
| `VITE_SUPABASE_ANON_KEY` | Ídem → *anon · public* |

Al pegar la clave, **comprueba que queda en una sola línea**: un salto de
línea dentro hace fallar la app con un «Invalid value» que no explica
nada.

Después de cambiarlas hay que **volver a desplegar**: se incrustan al
compilar, no se leen al vuelo.

### Analítica

*Pestaña Analytics → Enable.* Cuenta visitas y qué pantallas se ven, sin
cookies y sin identificar a nadie, así que no hace falta banner de
consentimiento. Gratis hasta 2.500 eventos al mes.

**No registra qué recetas se leen ni quién las lee.** Eso ya está en la
base de datos, que es donde tiene que estar: son datos de la familia, no
estadísticas de un tercero.

### El plan Hobby

Es para uso personal. Si esto llegara a generar dinero, habría que pasar
al de pago.

---

## Supabase

La base de datos, el almacén de fotos y audios, y las sesiones.

Es **PostgreSQL normal**: si algún día hay que salir de aquí, se hace un
volcado y se lleva a cualquier Postgres del mundo. No es un formato
propietario.

Todo lo que hay dentro está explicado en
[base-de-datos.md](base-de-datos.md).

### Ajustes que hay que dejar puestos

| Dónde | Qué |
| ----- | --- |
| Authentication → Providers | **Anonymous sign-ins** activado. Sin esto no entra nadie |
| Authentication → URL Configuration | *Site URL* y *Redirect URLs* con la dirección de Vercel |
| Project Settings → API | De ahí salen las dos claves |

### Las claves

- **`anon`** — pública por diseño. Viaja dentro del JavaScript que
  descarga cualquier navegador. No pasa nada: quien protege los datos son
  las políticas de la base.
- **`service_role`** — poder absoluto. **No debe salir nunca** de
  Supabase.
- **La contraseña de la base de datos** — no la usa la app. Es la única
  forma de sacar un volcado completo, y no se recupera si se pierde.

### Se pausa

El plan gratuito **pausa los proyectos** que pasan unos días sin
peticiones. No hay ningún ajuste para desactivarlo: es política, no una
opción. Las alternativas son pagar el plan Pro (25 $/mes) o mantenerlo
despierto, que es lo que se hace.

Si se pausa, **no se pierde nada**: se reactiva desde el panel en un par
de minutos.

---

## cron-job.org

El despertador principal. Llama una vez al día a Supabase para que no lo
den por inactivo.

| Campo | Valor |
| ----- | ----- |
| URL | `https://TU-PROYECTO.supabase.co/auth/v1/health` |
| Programación | Cada día |
| Encabezado | Nombre `apikey`, valor la clave *anon* |

El encabezado va en la pestaña **Avanzado → Encabezados → Añadir**. No es
lo mismo que «Requiere autenticación HTTP», que se queda apagado.

Se eligió ese endpoint y no una tabla porque **una consulta a las recetas
sin sesión devuelve 401 por diseño**, y el despertador habría fallado
siempre.

Vive fuera del proyecto a propósito: así no depende de que se toque el
repositorio, que es justo lo que falla si esto se deja quieto unos meses.

---

## Si algún día falla algo

| Falla | Qué pasa | Qué hacer |
| ----- | -------- | --------- |
| **Vercel** | La web deja de cargar | Los datos siguen en Supabase. Se vuelve a desplegar desde GitHub |
| **Supabase** | La web carga pero sin recetas | Si está pausado, reactivar en el panel |
| **cron-job.org** | Nada inmediato | Queda el despertador de GitHub |
| **GitHub** | Nada inmediato | La web sigue publicada. El código está también en tu ordenador |
| **Todos** | — | Queda el ZIP de la copia de seguridad, que no depende de ninguno |

**Bájate la copia de seguridad de vez en cuando** desde Ajustes. Es lo
único que no depende de que ningún servicio siga existiendo.
