# Arquitectura

Notas para quien vuelva a este código dentro de seis meses (probablemente
tú). Explica el **porqué**; el **qué** ya está en los comentarios del
código.

---

## 1. Capas

```
Páginas          →  cargan datos y colocan secciones
Componentes      →  saben pintarse, no saben de dónde vienen los datos
api.ts           →  única frontera con la base de datos
nucleo/supabase  →  única dependencia del proveedor
```

La regla que ordena todo: **una pantalla nunca importa `supabase`**. Habla
con el `api.ts` de su funcionalidad. Si mañana hay que migrar a otro
proveedor, se reescriben los `api.ts` y ninguna vista se entera.

## 2. Por qué carpetas por funcionalidad

La alternativa habitual es agrupar por tipo (`components/`, `hooks/`,
`services/`). Se lee bien cuando el proyecto es pequeño y se rompe cuando
crece: tocar "variantes" te obliga a saltar entre cuatro carpetas.

Aquí, `src/variantes/` contiene sus tipos, su acceso a datos y su interfaz.
Se borra la carpeta y desaparece la funcionalidad entera.

`src/ui/` es la excepción a propósito: son piezas sin dominio (un input, una
lista ordenable) que no pertenecen a ninguna funcionalidad.

## 3. Por qué JSONB para el cuerpo de la receta

Ingredientes, materiales, pasos y trucos van en columnas `jsonb`, no en
cuatro tablas relacionadas.

El criterio es **cómo cambian los datos**, no cómo se dibujan en un
diagrama. Estas cuatro listas se escriben y se guardan siempre juntas, en
la misma pantalla, por la misma persona. Nadie edita "el ingrediente 3"
por su cuenta. Normalizarlas costaría cuatro joins en cada lectura y una
transacción en cada guardado, a cambio de nada.

Las variantes sí son tabla propia, y por el mismo criterio: **las escribe
otra persona, en otro momento, sobre una receta que ya existe**.

Si algún día hace falta buscar por ingrediente, PostgreSQL indexa JSONB con
GIN sin migrar nada.

## 4. Por qué `cantidadCasera` existe

Es la decisión de producto más importante del modelo.

Las recetas familiares no vienen en gramos. Vienen en «un puñado», «un vaso
de los del vino», «harina la que admita», «hasta que la masa te pida más».
Obligar a convertirlo a gramos no digitaliza la receta: la sustituye por
otra.

Por eso `cantidad`/`unidad` y `cantidadCasera` conviven, las dos opcionales.
`textoCantidad()` decide cómo se lee: si hay medida casera manda ella, y la
exacta queda entre paréntesis para quien quiera pesar.

## 5. `ListaEditable`: una implementación, cuatro editores

Ingredientes, materiales, pasos y trucos necesitan lo mismo: añadir, quitar
y reordenar. Lo único que cambia son los campos de cada fila.

`ui/ListaEditable.tsx` implementa el comportamiento una vez y recibe los
campos por la prop `fila`. Los cuatro editores son envoltorios de treinta
líneas. Añadir una quinta lista no toca `ListaEditable`.

## 6. Estado del formulario en un hook

`useFormularioReceta` carga, edita y guarda. `PaginaEditarReceta` solo
coloca campos.

Dos ventajas concretas: la lógica se prueba sin montar la interfaz, y
crear y editar comparten exactamente el mismo camino — sin `id` inserta,
con `id` actualiza, y no hay dos pantallas que se desincronicen.

## 7. Seguridad

Toda la protección está en **RLS de PostgreSQL**, no en el cliente. La
clave `anon` es pública por diseño y da igual que se vea en el navegador:
sin sesión válida, las políticas no devuelven ni una fila.

Alcance actual: **una familia**. Cualquiera con cuenta ve y edita el
recetario; solo quien creó una receta puede borrarla.

Para pasar a multi-familia (comentado también en `schema.sql`):

1. Añadir `familia_id uuid` a `receta` y `variante`.
2. Crear la tabla `miembro (usuario_id, familia_id)`.
3. Sustituir los `using (true)` por
   `using (familia_id = (select familia_id from miembro where usuario_id = auth.uid()))`.

Nada del código de la aplicación cambia salvo el alta de familia.

## 8. Accesibilidad

No es una capa de barniz: quien aporta el contenido tiene 70 u 80 años.

- Base de **18px**, no 16px.
- Contraste **AA** en claro y oscuro.
- **Sin contraseñas**: se entra con un enlace al correo.
- Foco siempre visible (`:focus-visible` con contorno de 3px).
- Objetivos táctiles de **44px** en los controles pequeños.
- Etiquetas reales enlazadas por `id`, `aria-pressed` en los conmutadores,
  `role="status"` y `role="alert"` en los avisos.

## 9. Responsive

Tres contextos reales de uso, no tres breakpoints inventados:

| Dónde    | Cuándo                    | Qué cambia                                    |
| -------- | ------------------------- | --------------------------------------------- |
| Móvil    | De pie, cocinando         | Una columna, botones a lo ancho, barra pegada  |
| Tablet   | Apoyada en la encimera    | Dos columnas, ingredientes junto a los pasos   |
| Portátil | Sentada, escribiendo      | Rejilla de tres, formulario a dos columnas     |

El modo cocina sube el texto a `1.35rem` y mantiene la pantalla encendida
con Wake Lock, volviendo a pedirlo al regresar a la pestaña.

## 10. Pendiente

- **Audio.** La columna `audio_url` y `almacenamiento.ts` ya están listos;
  falta grabar con `MediaRecorder` y un reproductor en la ficha.
- **Tests.** `formato.ts` es puro y es por donde empezar (Vitest).
- **Exportar a PDF.** Las funciones de `formato.ts` se reutilizan tal cual.
