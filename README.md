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
ocasión —de una a cuatro por fila—  agrupadas por plato, por quién la hacía o por ocasión. 
Y el **libro**, que se abre a pantalla completa: cada receta en su pliego, el índice
troquelado en el canto y las hojas girando sobre la costura.
<img width="1143" height="655" alt="image" src="https://github.com/user-attachments/assets/0f7fa94a-72e0-4207-924c-ebbee78592e4" />

**Con su voz.** La receta entera contada de viva voz tanto en notas sueltas 
en cada apartado como en una grabación completa. Así mismo, puedes escribir dictando.
<img width="1236" height="839" alt="image" src="https://github.com/user-attachments/assets/373553d8-53a9-4546-bd62-fca486324c2e" />
<img width="1248" height="637" alt="image" src="https://github.com/user-attachments/assets/d933a3a2-a2e8-43e0-a1a8-8b88241c9dfb" />

**Modo libro:** `Lee, pasa las páginas y busca por índice.

**Se instala** en el móvil o la tablet como una aplicación más, y las
recetas ya vistas funcionan sin conexión. Es una PWA.
<img width="1241" height="429" alt="image" src="https://github.com/user-attachments/assets/d22b9e9a-89dd-4d1a-b1b7-915fdf7ccb21" />
<img width="102" height="101" alt="image" src="https://github.com/user-attachments/assets/b0e62ba6-4e9a-4793-a8df-bc1c0158b7b2" />

**Copia de seguridad** puedes descargar una copia de las recetas en PDF.
<img width="1241" height="270" alt="image" src="https://github.com/user-attachments/assets/7cd9b81b-5b0b-41a9-b74d-f2167504436d" />

---

## Puesta en marcha

Abre la web, inicia sesión. Aparecerá un mensaje para dejarlo en tu escritorio como una PWA.


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
<img width="1278" height="1021" alt="image" src="https://github.com/user-attachments/assets/5e8a34ef-f9b2-4264-96d4-4034baa3974f" />


---
