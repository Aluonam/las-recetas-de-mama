-- ============================================================
--  002 · Lista de invitados
--
--  PARA QUÉ SIRVE ESTO
--
--  El esquema inicial dice «cualquiera con sesión ve el recetario».
--  Eso está bien mientras la app corre en tu portátil, pero deja de
--  estarlo en cuanto la publicas en internet: cualquiera que se
--  registre con cualquier correo entraría a las recetas de tu
--  familia, y podría editarlas.
--
--  Con esto, entrar deja de bastar. Además de tener sesión, tu
--  correo tiene que estar en la lista de invitados.
--
--  Ejecutar en Supabase → SQL Editor → Run, ANTES de publicar.
-- ============================================================

-- ------------------------------------------------------------
--  Quién es de la familia
-- ------------------------------------------------------------
create table if not exists public.invitado (
  correo      text primary key,
  nombre      text,
  invitado_en timestamptz not null default now()
);

-- Nadie lee esta tabla desde la app. Se activa RLS y no se crea
-- ninguna política: así queda cerrada a cal y canto, y solo la
-- consulta la función de abajo, que corre con permisos propios.
alter table public.invitado enable row level security;

comment on table public.invitado is
  'Correos que pueden entrar al recetario. Sin política de acceso a propósito.';

-- ------------------------------------------------------------
--  ¿El correo de quien pregunta está invitado?
-- ------------------------------------------------------------
create or replace function public.es_de_la_familia()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.invitado
    -- Sin distinguir mayúsculas: nadie escribe su correo igual dos veces.
    where lower(correo) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ------------------------------------------------------------
--  Las políticas pasan a exigir estar invitado
-- ------------------------------------------------------------
drop policy if exists receta_leer   on public.receta;
drop policy if exists receta_crear  on public.receta;
drop policy if exists receta_editar on public.receta;
drop policy if exists receta_borrar on public.receta;

create policy receta_leer on public.receta
  for select to authenticated
  using (public.es_de_la_familia());

create policy receta_crear on public.receta
  for insert to authenticated
  with check (public.es_de_la_familia() and creada_por = auth.uid());

create policy receta_editar on public.receta
  for update to authenticated
  using (public.es_de_la_familia())
  with check (public.es_de_la_familia());

create policy receta_borrar on public.receta
  for delete to authenticated
  using (public.es_de_la_familia() and creada_por = auth.uid());

drop policy if exists variante_leer   on public.variante;
drop policy if exists variante_crear  on public.variante;
drop policy if exists variante_borrar on public.variante;

create policy variante_leer on public.variante
  for select to authenticated
  using (public.es_de_la_familia());

create policy variante_crear on public.variante
  for insert to authenticated
  with check (public.es_de_la_familia() and creada_por = auth.uid());

create policy variante_borrar on public.variante
  for delete to authenticated
  using (public.es_de_la_familia() and creada_por = auth.uid());

-- ------------------------------------------------------------
--  Las fotos y los audios, igual
--
--  Ojo: el bucket se creó público para que las fotos se vean sin
--  pedir permiso en cada imagen. Eso significa que quien tenga la
--  URL exacta de una foto puede verla. Son direcciones con un
--  identificador aleatorio, imposibles de adivinar, pero no son un
--  secreto. Para un recetario familiar es un trato razonable; si no
--  te convence, dilo y se cambia a bucket privado con URLs
--  firmadas que caducan.
-- ------------------------------------------------------------
drop policy if exists recetas_subir  on storage.objects;
drop policy if exists recetas_borrar on storage.objects;

create policy recetas_subir on storage.objects
  for insert to authenticated
  with check (bucket_id = 'recetas' and public.es_de_la_familia());

create policy recetas_borrar on storage.objects
  for delete to authenticated
  using (bucket_id = 'recetas' and owner = auth.uid());

-- ============================================================
--  AÑADIR A LA FAMILIA
--
--  Cambia los correos por los de verdad y ejecuta. Puedes volver a
--  ejecutarlo cuando entre alguien nuevo.
-- ============================================================
insert into public.invitado (correo, nombre) values
  ('tu-correo@ejemplo.com',      'Yo'),
  ('la-suegra@ejemplo.com',      'La suegra'),
  ('mama@ejemplo.com',           'Mamá')
on conflict (correo) do nothing;

-- Comprobación: quién puede entrar ahora mismo.
select correo, nombre, invitado_en from public.invitado order by invitado_en;
