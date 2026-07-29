# Las Recetas de Mamá

El recetario de la familia. No es una app de cocina: es un **archivo
familiar**. Las recetas se pueden encontrar en cualquier web; lo que se
pierde es quién las hacía, cómo las contaba y por qué esa y no otra.

Cada receta guarda:

- **Ingredientes** con medidas exactas *y* caseras — «un puñado», «un vaso
  de los del vino», «harina la que admita».
- **Materiales**, porque «la cazuela de barro» a veces es media receta.
- **Pasos**, con foto opcional en cada uno.
- **Trucos**, y quién los decía.
- **Procedencia**: de quién es, quién se la enseñó, desde cuándo.
- **Por qué es especial**: la historia, el recuerdo, la ocasión.
- **Variantes**: «la versión de mamá, con menos nuez moscada».

---

## Puesta en marcha

> Para compartir el recetario con la familia de verdad —cada uno desde su
> móvil o su tablet— sigue la guía completa:
> **[docs/puesta-en-marcha.md](docs/puesta-en-marcha.md)**. Incluye cerrar
> el acceso a quien no esté invitado, que sin eso cualquiera que se
> registre entraría a tus recetas.

Lo que sigue es solo para levantarlo en tu ordenador. Necesitas Node 20 o
superior y una cuenta gratuita en [Supabase](https://supabase.com).

### 1. Instalar

```bash
npm install
```

### 2. Crear la base de datos

1. Crea un proyecto nuevo en Supabase.
2. Abre **SQL Editor**, pega el contenido de [`supabase/schema.sql`](supabase/schema.sql)
   y pulsa *Run*. Eso crea las tablas, la seguridad por filas y el
   almacén de fotos.

### 3. Configurar las claves

```bash
cp .env.example .env.local
```

Rellena `.env.local` con los valores de **Project Settings → API**:

| Variable                  | Dónde está           |
| ------------------------- | -------------------- |
| `VITE_SUPABASE_URL`       | *Project URL*        |
| `VITE_SUPABASE_ANON_KEY`  | *anon public key*    |

La clave `anon` es pública por diseño. Quien protege los datos es la
seguridad a nivel de fila (RLS) del esquema, no la clave.

### 4. Arrancar

```bash
npm run dev
```

Se entra con el correo: Supabase manda un enlace y no hay contraseñas.

### Comandos

| Comando           | Qué hace                          |
| ----------------- | --------------------------------- |
| `npm run dev`     | Servidor de desarrollo            |
| `npm run build`   | Comprueba tipos y compila         |
| `npm run preview` | Sirve lo compilado                |
| `npm run lint`    | Analiza el código                 |

---

## Cómo está organizado

Carpetas **por funcionalidad**, no por tipo de archivo. Para tocar las
variantes vas a `src/variantes/` y está todo ahí: sus tipos, su acceso a
datos y su interfaz.

```
src/
├── nucleo/            Infraestructura transversal
│   ├── supabase.ts       Único punto que conoce a Supabase
│   └── sesion.tsx        Contexto de sesión
│
├── ui/                Componentes sin dominio, reutilizables
│   ├── Marco.tsx         Cabecera, contenido y pie
│   ├── Campo.tsx         Input y textarea con etiqueta accesible
│   ├── ListaEditable.tsx Añadir, quitar y reordenar
│   └── Estado.tsx        Carga y error
│
├── autenticacion/     Entrar y proteger rutas
│
├── recetas/           La funcionalidad principal
│   ├── tipos.ts          Modelo de dominio
│   ├── api.ts            Acceso a datos
│   ├── almacenamiento.ts Subida de fotos
│   ├── formato.ts        Funciones puras de presentación
│   ├── componentes/      Piezas de la ficha
│   ├── paginas/          Recetario, ficha, modo cocina
│   └── editor/           Escribir y editar
│
├── variantes/         "Cómo la hace cada uno"
│
├── rutas.tsx          Mapa de pantallas
└── App.tsx            Composición
```

Más detalle en [`docs/arquitectura.md`](docs/arquitectura.md).

---

## Decisiones

**KISS.** El cuerpo de la receta (ingredientes, materiales, pasos, trucos)
va en columnas JSONB, no en cuatro tablas. Siempre se edita entero, así que
partirlo solo añadiría joins. Las variantes sí son tabla aparte porque las
escribe otra persona, en otro momento.

**Una responsabilidad por archivo.** Las páginas cargan datos y colocan
secciones. El estado del formulario vive en un hook. Las funciones de
presentación son puras y no saben que existe React.

**Abierto a extensión, cerrado a modificación.** `ListaEditable` implementa
añadir, quitar y reordenar una sola vez; ingredientes, materiales, pasos y
trucos solo aportan sus campos. Añadir una quinta lista no toca ese archivo.

**Las pantallas no conocen la base de datos.** Hablan con `api.ts` de su
funcionalidad. Cambiar de proveedor de datos toca un archivo por
funcionalidad y ninguna vista.

**Accesibilidad, no adorno.** Quien aporta el contenido tiene 70 u 80 años:
base de 18px, contraste AA en claro y oscuro, foco siempre visible,
objetivos táctiles de 44px y entrada sin contraseñas.

**Responsive de verdad.** Se usa en móvil de pie en la cocina, en tablet
apoyada en la encimera y en portátil sentada. Una columna en móvil, dos
desde `sm`, ingredientes junto a los pasos desde `md`.

---

## Lo que viene

- **Audio**: grabar a quien cuenta la receta con su voz. Es la función más
  valiosa y la más urgente. La columna `audio_url` ya existe.
- **Exportar a PDF**: el recetario familiar impreso.
- **Multi-familia**: cada familia con su espacio y código de invitación.
  El camino está comentado en `supabase/schema.sql`.
