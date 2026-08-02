# Las Recetas de Mamá

El recetario de la familia. No es una app de cocina: es un **archivo
familiar**. Las recetas de tu familia contadas por tu abuela.

**¿Quieres iniciar sesión?**
Introduce tu correo electrónico y el código de prueba: ABC-792286
[las-recetas-de-mama.vercel.app](https://las-recetas-de-mama.vercel.app)
<img width="1267" height="873" alt="image" src="https://github.com/user-attachments/assets/c1638441-f2e9-4f47-a9a3-8b2b9ad6ac8c" />

<img width="1525" height="898" alt="image" src="https://github.com/user-attachments/assets/55f70d1e-f0e9-44d8-9f0c-e32f664ed0c2" />


| | Servicio | Para qué |
| --- | -------- | -------- |
| 🌐 | [Vercel](https://vercel.com) | Publica la web y Analytics |
| 🗄️ | [Supabase](https://supabase.com) | SQL DB que almacena: Recetas, fotos, audios y accesos |
| ⏰ | [cron-job.org](https://cron-job.org) | Evita la desactivación de la base de datos |

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

**Cada familia tiene su recetario**, con un código compartido. 
Quien lo escribe entra y se registra su acceso. 
Un recetario ajeno no existe para quien no es miembro.
Solo existe confirmación para el usuario administrador.

**Dos formas de mirarlo y una de leerlo:** tarjetas con filtro por
ocasión —de una a cuatro por fila, como en una tienda de ropa— o lista
agrupada por plato, por quién la hacía o por ocasión. Y el **libro**, que
se abre a pantalla completa: cada receta en su pliego, el índice
troquelado en el canto y las hojas girando sobre la costura.
<img width="1512" height="879" alt="image" src="https://github.com/user-attachments/assets/417c081d-a152-4e83-a6eb-cf5695b01f94" />
<img width="1256" height="878" alt="image" src="https://github.com/user-attachments/assets/2ef8cf1b-76c6-46c1-bce4-fbfb21adb438" />

**Con su voz.** La receta entera contada de viva voz tanmto en notas sueltas 
en cada apartado como en una grabación completa. Así mismo, puedes escribir dictando.

**Modo libro:** 

**Se instala** en el móvil o la tablet como una aplicación más, y las
recetas ya vistas funcionan sin conexión. Es una PWA.

**Copia de seguridad** puedes descargar una copia de las recetas en PDF.

---

## Puesta en marcha

Abre la web, inicia sesión. Aparecerá un mensaje para dejarlo en tu escritorio
como una PWA.

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

**KISS:**
**Las pantallas no conocen la base de datos.** Hablan con el `api.ts` de
su funcionalidad. Eso permitió meter un modo demostración completo sin
tocar ninguna vista.

**Seguridad proporcional.** Se protege que un recetario no se mezcle con
otro y que las fotos no queden en direcciones permanentes. 
La autenticación de doble factor es innecesaria y pierde accesibilidad.

**Ajustes** Desde ajustes puedes añadir otro recetario familiar. 
Podrás cambiar de uno a otro sin iniciar sesión de nuevo. Así como, identificarte como administrador 
Podrás notificar cualquier error o sugerencia al administrador del recetario.
Descarga una copia de seguridad de todas vuestras recetas.

**ENJOY IT**


---
