# Las Recetas de Mamá

El recetario de la familia. No es una app de cocina: es un **archivo
familiar**. Las recetas se pueden encontrar en cualquier web; lo que se
pierde es quién las hacía, cómo las contaba y por qué esa y no otra.

**En marcha:** [las-recetas-de-mama.vercel.app](https://las-recetas-de-mama.vercel.app)

| | Servicio | Para qué |
| --- | -------- | -------- |
| 🌐 | [Vercel](https://vercel.com) | Publica la web y cuenta las visitas |
| 🗄️ | [Supabase](https://supabase.com) | Recetas, fotos, audios y accesos |
| ⏰ | [cron-job.org](https://cron-job.org) | Que Supabase no se duerma |

Todos con plan gratuito. Detalle de cada uno, con sus ajustes y qué hacer
si falla, en **[docs/servicios.md](docs/servicios.md)**.

---

## Qué guarda una receta

- **Ingredientes** con medidas exactas *y* caseras — «un puñado», «un vaso
  de los del vino», «harina la que admita». Obligar a gramos no digitaliza
  la receta: la sustituye por otra.
- **Materiales**, porque «la cazuela de barro» a veces es media receta.
- **Pasos**, con foto opcional en cada uno.
- **Trucos**, y quién los decía.
- **Procedencia**: de quién es, quién se la enseñó, desde cuándo.
- **Por qué es especial**: la historia, el recuerdo, la ocasión.
- **La voz de quien la cuenta**: grabada ahí mismo, o esa nota de WhatsApp
  que ya tenías. Es lo único de una receta que no se puede reconstruir
  después.
- **Variantes**: «la versión de mamá, con menos nuez moscada».

## Cómo se usa

**Cada familia tiene su recetario**, con un código que se comparte por
WhatsApp. Quien lo escribe entra: sin cuentas, sin contraseñas, sin
esperar ningún correo. Un recetario ajeno no existe para quien no es
miembro — no se ve ni su nombre.

**Dos formas de mirarlo y una de leerlo:** tarjetas con filtro por
ocasión —de una a cuatro por fila, como en una tienda de ropa— o lista
agrupada por plato, por quién la hacía o por ocasión. Y el **libro**, que
se abre a pantalla completa: cada receta en su pliego, el índice
troquelado en el canto y las hojas girando sobre la costura.

**Con su voz.** La receta entera contada de viva voz, notas sueltas
pegadas a cada apartado —«las manzanas tienen que quedar rectas por la
base»— y una grabación por paso. Y dictado, para quien prefiere hablar a
escribir.

**Modo cocina:** texto grande, ingredientes fijos arriba, pasos que se
tachan al tocarlos y la pantalla que no se apaga.

**Se instala** en el móvil o la tablet como una aplicación más, y las
recetas ya vistas funcionan sin conexión.

**Copia de seguridad** en un ZIP que se abre sin esta aplicación.

---

## Puesta en marcha

Para montarlo de cero —base de datos, publicación e instalación en la
tablet— sigue la guía completa:

**[docs/puesta-en-marcha.md](docs/puesta-en-marcha.md)**

Para levantarlo solo en tu ordenador:

```bash
npm install
npm run dev
```

Sin claves de Supabase arranca en **modo demostración**: guarda en el
navegador y trae tres recetas de ejemplo. Para conectarlo de verdad, copia
`.env.example` a `.env.local` y rellena las dos claves.

| Comando | Qué hace |
| ------- | -------- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Comprueba tipos y compila |
| `npm run lint` | Analiza el código |
| `node scripts/prueba-permisos.mjs` | Comprueba los permisos contra la base real |

---

## Cómo está organizado

Carpetas **por funcionalidad**, no por tipo de archivo. Para tocar las
variantes vas a `src/variantes/` y está todo ahí.

```
src/
├── nucleo/        Cliente de datos, sesión, entorno
├── ui/            Componentes sin dominio: marco, campos, listas
├── familias/      Recetarios, códigos, quién manda
├── autenticacion/ Esperar a que la sesión esté abierta
├── recetas/       La funcionalidad principal
│   ├── tipos.ts · api.ts · almacenamiento.ts · formato.ts
│   ├── componentes/  Piezas de la ficha
│   ├── paginas/      Recetario, ficha, modo cocina
│   ├── editor/       Escribir y editar
│   ├── libro/        El libro de hojas que se pasan
│   ├── indice/       Orden alfabético y agrupaciones
│   ├── audio/        Grabar y reproducir
│   └── archivos/     Enlaces firmados de fotos y audios
├── variantes/     «Cómo la hace cada uno»
├── ajustes/       Código, administración, copia de seguridad
├── copias/        Exportar el recetario a un ZIP
└── pwa/           Instalación en la pantalla de inicio
```

## Documentación

| Archivo | Qué cuenta |
| ------- | ---------- |
| [`docs/servicios.md`](docs/servicios.md) | Qué servicios se usan, sus ajustes y qué hacer si alguno falla |
| [`docs/puesta-en-marcha.md`](docs/puesta-en-marcha.md) | Montarlo de cero, paso a paso |
| [`docs/base-de-datos.md`](docs/base-de-datos.md) | El modelo, los permisos y la seguridad |
| [`docs/arquitectura.md`](docs/arquitectura.md) | Por qué el código está así |

---

## Decisiones

**Las reglas viven en la base, no en la pantalla.** Quién ve qué y quién
puede borrar lo deciden las políticas de PostgreSQL. La app esconde los
botones que no funcionarían, pero eso es cortesía: esconder un botón no
impide nada a quien sepa escribir una petición a mano. Por eso existe
`scripts/prueba-permisos.mjs`, que lo comprueba contra la base de verdad.

**KISS.** El cuerpo de la receta va en columnas JSONB, no en cuatro
tablas: siempre se edita entero, así que partirlo solo añadiría joins.

**Las pantallas no conocen la base de datos.** Hablan con el `api.ts` de
su funcionalidad. Eso permitió meter un modo demostración completo sin
tocar ninguna vista.

**Accesibilidad, no adorno.** Quien aporta el contenido tiene 70 u 80
años: base de 18px, contraste AA en claro y oscuro, foco siempre visible,
objetivos táctiles de 44px y entrada sin contraseñas.

**Seguridad proporcional.** Se protege que un recetario no se mezcle con
otro y que las fotos no queden en direcciones permanentes. No hay límite
de intentos ni doble factor: cada capa se paga en complicación, y la
complicación se paga en que la abuela no sepa entrar. Está razonado en
[`docs/base-de-datos.md`](docs/base-de-datos.md#seguridad).

---

## Lo que viene

- **Exportar a PDF**, para el recetario familiar impreso.
- **Limitar los intentos** al probar códigos, si esto dejara de ser
  familiar.
- **Copias automáticas**, que hoy dependen de pulsar un botón.
