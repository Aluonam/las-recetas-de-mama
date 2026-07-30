-- ============================================================
--  Las Recetas de Mamá — esquema de base de datos
--
--  Pegar en Supabase → SQL Editor → Run.
--
--  QUÉ HACE, POR ORDEN
--    1. Las tablas: receta y variante.
--    2. Los índices: buscar por ocasión, y por título o autor.
--    3. Un disparador que pone al día la fecha de modificación.
--    4. Los permisos: quién puede asomarse a cada tabla.
--    5. La protección por filas: qué filas ve quien se asoma.
--    6. El almacén de fotos y audios.
--
--  SOBRE EL AVISO DE «OPERACIONES DESTRUCTIVAS»
--
--  Supabase lo saca al ver la palabra `drop`. Aquí solo hay
--  `drop policy if exists` y `drop trigger if exists`: reglas de
--  seguridad, no datos. No hay ningún drop table, truncate ni
--  delete from. En un proyecto nuevo no borran nada, porque esas
--  reglas todavía no existen.
--
--  Están para que este archivo se pueda volver a ejecutar. Si hay
--  que retocar una regla, se cambia y se pasa entero: quita la
--  vieja y pone la nueva. Sin esas líneas, la segunda ejecución se
--  pararía con «esa regla ya existe».
--
--  Explicación completa en docs/base-de-datos.md.
-- ============================================================

-- ------------------------------------------------------------
--  Tabla principal
-- ------------------------------------------------------------
create table if not exists public.receta (
  id                uuid primary key default gen_random_uuid(),

  titulo            text not null check (length(trim(titulo)) > 0),
  descripcion       text,

  -- Procedencia: de quién es la receta y por dónde ha pasado.
  autor_nombre      text,
  autor_relacion    text,
  aprendida_de      text,
  anio_origen       smallint check (anio_origen between 1850 and 2100),

  por_que_especial  text,

  ocasiones         text[] not null default '{}',
  raciones          text,
  tiempo_minutos    integer check (tiempo_minutos > 0),

  -- Cuerpo de la receta. Se edita siempre entero, así que JSONB.
  ingredientes      jsonb not null default '[]'::jsonb,
  materiales        jsonb not null default '[]'::jsonb,
  pasos             jsonb not null default '[]'::jsonb,
  trucos            jsonb not null default '[]'::jsonb,
  fotos             jsonb not null default '[]'::jsonb,

  foto_portada_url  text,

  -- Reservado para la grabación de voz (aún sin interfaz).
  audio_url         text,

  creada_por        uuid not null references auth.users (id) on delete cascade,
  creada_en         timestamptz not null default now(),
  actualizada_en    timestamptz not null default now()
);

-- ------------------------------------------------------------
--  Variantes: "la versión de mamá, con menos nuez moscada"
-- ------------------------------------------------------------
create table if not exists public.variante (
  id            uuid primary key default gen_random_uuid(),
  receta_id     uuid not null references public.receta (id) on delete cascade,
  autor_nombre  text not null,
  titulo        text not null,
  texto         text not null,
  creada_por    uuid not null references auth.users (id) on delete cascade,
  creada_en     timestamptz not null default now()
);

create index if not exists variante_receta_idx on public.variante (receta_id);

-- Búsqueda por ocasión ("enséñame lo de Nochebuena").
create index if not exists receta_ocasiones_idx on public.receta using gin (ocasiones);

-- Buscador por título y por quién la hacía.
create index if not exists receta_busqueda_idx on public.receta
  using gin (to_tsvector('spanish', coalesce(titulo, '') || ' ' || coalesce(autor_nombre, '')));

-- ------------------------------------------------------------
--  actualizada_en automático
-- ------------------------------------------------------------
create or replace function public.tocar_actualizada_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizada_en = now();
  return new;
end;
$$;

drop trigger if exists receta_actualizada_en on public.receta;
create trigger receta_actualizada_en
  before update on public.receta
  for each row execute function public.tocar_actualizada_en();

-- ------------------------------------------------------------
--  Permisos del API
--
--  Supabase puede dar estos permisos solo a cada tabla nueva
--  («Automatically expose new tables»), pero su propia recomendación
--  es desactivarlo y concederlos a mano. Concediéndolos aquí, esa
--  opción puede quedar apagada: una tabla que se cree más adelante no
--  quedará expuesta por descuido.
--
--  Esto es solo el permiso de asomarse. Lo que decide qué filas se
--  ven son las políticas de más abajo.
-- ------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.receta   to authenticated;
grant select, insert, delete         on public.variante to authenticated;

-- Sin sesión no se toca nada. El recetario no es público.
revoke all on public.receta   from anon;
revoke all on public.variante from anon;

-- ------------------------------------------------------------
--  Seguridad (RLS)
--
--  Alcance actual: UNA familia. Cualquier persona con cuenta ve y
--  edita todo el recetario, y solo quien creó una receta puede
--  borrarla.
--
--  Para pasar a multi-familia: añadir `familia_id uuid` a ambas
--  tablas y sustituir los `using (true)` por
--  `using (familia_id = (select familia_id from miembro
--                        where usuario_id = auth.uid()))`.
--  Nada más del esquema cambia.
-- ------------------------------------------------------------
alter table public.receta   enable row level security;
alter table public.variante enable row level security;

drop policy if exists receta_leer   on public.receta;
drop policy if exists receta_crear  on public.receta;
drop policy if exists receta_editar on public.receta;
drop policy if exists receta_borrar on public.receta;

create policy receta_leer on public.receta
  for select to authenticated using (true);

create policy receta_crear on public.receta
  for insert to authenticated with check (creada_por = auth.uid());

create policy receta_editar on public.receta
  for update to authenticated using (true) with check (true);

create policy receta_borrar on public.receta
  for delete to authenticated using (creada_por = auth.uid());

drop policy if exists variante_leer   on public.variante;
drop policy if exists variante_crear  on public.variante;
drop policy if exists variante_borrar on public.variante;

create policy variante_leer on public.variante
  for select to authenticated using (true);

create policy variante_crear on public.variante
  for insert to authenticated with check (creada_por = auth.uid());

create policy variante_borrar on public.variante
  for delete to authenticated using (creada_por = auth.uid());

-- ------------------------------------------------------------
--  Almacenamiento de fotos (y, más adelante, audio)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('recetas', 'recetas', true)
on conflict (id) do nothing;

drop policy if exists recetas_ver    on storage.objects;
drop policy if exists recetas_subir  on storage.objects;
drop policy if exists recetas_borrar on storage.objects;

create policy recetas_ver on storage.objects
  for select using (bucket_id = 'recetas');

create policy recetas_subir on storage.objects
  for insert to authenticated with check (bucket_id = 'recetas');

create policy recetas_borrar on storage.objects
  for delete to authenticated using (bucket_id = 'recetas' and owner = auth.uid());
