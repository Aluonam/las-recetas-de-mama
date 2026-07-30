-- ============================================================
--  004 · Varios recetarios, uno por familia
--
--  QUÉ CAMBIA
--
--  Hasta ahora había un solo recetario y se entraba estando en una
--  lista que se editaba a mano con SQL. A partir de aquí cada
--  familia crea el suyo y recibe un código. Quien tenga el código
--  entra; quien no, no ve nada de nadie.
--
--  El código es la llave y se comparte por WhatsApp. Se puede
--  cambiar cuando se quiera: quien ya entró sigue dentro, y el
--  código viejo deja de servir.
--
--  Ejecutar DESPUÉS de 003. Sustituye a la lista de invitados del
--  002, que queda sin uso pero no se borra por si hiciera falta
--  mirar quién estaba invitado antes.
-- ============================================================

begin;

-- ------------------------------------------------------------
--  Los recetarios y quién pertenece a cada uno
-- ------------------------------------------------------------
create table if not exists public.familia (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null check (length(trim(nombre)) > 0),
  codigo     text not null unique,
  creada_por uuid not null references auth.users (id) on delete cascade,
  creada_en  timestamptz not null default now()
);

create table if not exists public.miembro (
  familia_id uuid not null references public.familia (id) on delete cascade,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  correo     text,
  unido_en   timestamptz not null default now(),
  primary key (familia_id, usuario_id)
);

create index if not exists miembro_usuario_idx on public.miembro (usuario_id);

-- ------------------------------------------------------------
--  Cada receta pasa a saber de qué casa es
-- ------------------------------------------------------------
alter table public.receta
  add column if not exists familia_id uuid references public.familia (id) on delete cascade;

alter table public.variante
  add column if not exists familia_id uuid references public.familia (id) on delete cascade;

create index if not exists receta_familia_idx   on public.receta (familia_id);
create index if not exists variante_familia_idx on public.variante (familia_id);

-- ------------------------------------------------------------
--  A qué recetarios pertenece quien pregunta
--
--  Con permisos propios (security definer) porque tiene que leer la
--  tabla de miembros, que está cerrada. Devuelve solo identificadores
--  de recetarios propios: nunca dice nada de los ajenos.
-- ------------------------------------------------------------
create or replace function public.mis_recetarios()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select familia_id from public.miembro where usuario_id = auth.uid();
$$;

grant execute on function public.mis_recetarios() to authenticated;

-- ------------------------------------------------------------
--  Generar un código legible
--
--  Palabra y número, sin acentos ni eñes: se dicta por teléfono y se
--  teclea en una tablet sin equivocarse. Se repite hasta dar con uno
--  libre.
-- ------------------------------------------------------------
create or replace function public.generar_codigo()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  palabras text[] := array[
    'MEMBRILLO','AZAFRAN','CANELA','ROMERO','LAUREL','PIMENTON',
    'ALMENDRA','NARANJA','TOMILLO','ANIS','NUEZ','HIGO',
    'CASTANA','MANZANA','CEREZA','ALBAHACA','PEREJIL','OREGANO'
  ];
  intento text;
begin
  loop
    intento :=
      palabras[1 + floor(random() * array_length(palabras, 1))::int]
      || '-' || lpad(floor(random() * 10000)::text, 4, '0');
    exit when not exists (select 1 from public.familia where codigo = intento);
  end loop;
  return intento;
end;
$$;

-- ------------------------------------------------------------
--  Crear un recetario
-- ------------------------------------------------------------
create or replace function public.crear_recetario(p_nombre text)
returns table (id uuid, nombre text, codigo text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id     uuid;
  v_codigo text;
begin
  if auth.uid() is null then
    raise exception 'Hay que iniciar sesion para crear un recetario.';
  end if;

  if coalesce(trim(p_nombre), '') = '' then
    raise exception 'El recetario necesita un nombre.';
  end if;

  v_codigo := public.generar_codigo();

  insert into public.familia (nombre, codigo, creada_por)
  values (trim(p_nombre), v_codigo, auth.uid())
  returning familia.id into v_id;

  insert into public.miembro (familia_id, usuario_id, correo)
  values (v_id, auth.uid(), auth.jwt() ->> 'email');

  return query select v_id, trim(p_nombre), v_codigo;
end;
$$;

grant execute on function public.crear_recetario(text) to authenticated;

-- ------------------------------------------------------------
--  Entrar en uno que ya existe
--
--  Si el codigo no vale, el mensaje es el mismo siempre: así nadie
--  puede ir probando códigos para averiguar cuáles existen.
-- ------------------------------------------------------------
create or replace function public.unirse_con_codigo(p_codigo text)
returns table (id uuid, nombre text, codigo text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_familia public.familia%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Hay que iniciar sesion para entrar en un recetario.';
  end if;

  select * into v_familia
  from public.familia
  -- Sin distinguir mayúsculas ni espacios sobrantes: el código llega
  -- copiado de un WhatsApp y nadie lo pega limpio.
  where upper(trim(codigo)) = upper(trim(p_codigo));

  if not found then
    raise exception 'Ese codigo no vale. Comprueba que esta bien escrito.';
  end if;

  insert into public.miembro (familia_id, usuario_id, correo)
  values (v_familia.id, auth.uid(), auth.jwt() ->> 'email')
  on conflict (familia_id, usuario_id) do nothing;

  return query select v_familia.id, v_familia.nombre, v_familia.codigo;
end;
$$;

grant execute on function public.unirse_con_codigo(text) to authenticated;

-- ------------------------------------------------------------
--  Cambiar el código
--
--  Un código que circula por WhatsApp acaba donde no debe. Con esto
--  se genera otro y el viejo deja de servir; quien ya entró sigue
--  dentro, porque ser miembro no depende del código.
-- ------------------------------------------------------------
create or replace function public.cambiar_codigo(p_familia_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_codigo text;
begin
  if not exists (
    select 1 from public.miembro
    where familia_id = p_familia_id and usuario_id = auth.uid()
  ) then
    raise exception 'Ese recetario no es tuyo.';
  end if;

  v_codigo := public.generar_codigo();
  update public.familia set codigo = v_codigo where id = p_familia_id;
  return v_codigo;
end;
$$;

grant execute on function public.cambiar_codigo(uuid) to authenticated;

-- ------------------------------------------------------------
--  Permisos y seguridad de las tablas nuevas
-- ------------------------------------------------------------
alter table public.familia enable row level security;
alter table public.miembro enable row level security;

revoke all on public.miembro from anon, authenticated;
revoke all on public.familia from anon;
grant select on public.familia to authenticated;

drop policy if exists familia_leer on public.familia;

-- Solo se ve el recetario propio. El de los demás no existe para ti,
-- ni siquiera su nombre.
create policy familia_leer on public.familia
  for select to authenticated
  using (id in (select public.mis_recetarios()));

-- ------------------------------------------------------------
--  Las recetas pasan a mirar la familia
-- ------------------------------------------------------------
drop policy if exists receta_leer   on public.receta;
drop policy if exists receta_crear  on public.receta;
drop policy if exists receta_editar on public.receta;
drop policy if exists receta_borrar on public.receta;

create policy receta_leer on public.receta
  for select to authenticated
  using (familia_id in (select public.mis_recetarios()));

create policy receta_crear on public.receta
  for insert to authenticated
  with check (
    familia_id in (select public.mis_recetarios())
    and creada_por = auth.uid()
  );

create policy receta_editar on public.receta
  for update to authenticated
  using (familia_id in (select public.mis_recetarios()))
  with check (familia_id in (select public.mis_recetarios()));

create policy receta_borrar on public.receta
  for delete to authenticated
  using (
    familia_id in (select public.mis_recetarios())
    and creada_por = auth.uid()
  );

drop policy if exists variante_leer   on public.variante;
drop policy if exists variante_crear  on public.variante;
drop policy if exists variante_borrar on public.variante;

create policy variante_leer on public.variante
  for select to authenticated
  using (familia_id in (select public.mis_recetarios()));

create policy variante_crear on public.variante
  for insert to authenticated
  with check (
    familia_id in (select public.mis_recetarios())
    and creada_por = auth.uid()
  );

create policy variante_borrar on public.variante
  for delete to authenticated
  using (
    familia_id in (select public.mis_recetarios())
    and creada_por = auth.uid()
  );

-- ------------------------------------------------------------
--  Las fotos y los audios, por casa
--
--  Cada archivo se guarda en una carpeta con el identificador de su
--  recetario. Sin esto, la base no tendría forma de saber de quién es
--  una foto y bastaría con adivinar una ruta.
-- ------------------------------------------------------------
drop policy if exists recetas_ver    on storage.objects;
drop policy if exists recetas_subir  on storage.objects;
drop policy if exists recetas_borrar on storage.objects;

create policy recetas_ver on storage.objects
  for select to authenticated
  using (
    bucket_id = 'recetas'
    and (storage.foldername(name))[1] in (
      select public.mis_recetarios()::text
    )
  );

create policy recetas_subir on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'recetas'
    and (storage.foldername(name))[1] in (
      select public.mis_recetarios()::text
    )
  );

create policy recetas_borrar on storage.objects
  for delete to authenticated
  using (bucket_id = 'recetas' and owner = auth.uid());

commit;

-- ------------------------------------------------------------
--  Si ya tenías recetas del modelo anterior
--
--  Se quedaron sin familia y por tanto invisibles. Crea tu recetario
--  desde la app y luego ejecuta esto para adoptarlas, poniendo tu
--  código donde toca.
-- ------------------------------------------------------------
-- update public.receta
-- set familia_id = (select id from public.familia where codigo = 'TU-CODIGO')
-- where familia_id is null;
--
-- update public.variante v
-- set familia_id = r.familia_id
-- from public.receta r
-- where v.receta_id = r.id and v.familia_id is null;

-- Comprobación: los recetarios que existen y cuántos miembros tienen.
select f.nombre, f.codigo, count(m.usuario_id) as miembros
from public.familia f
left join public.miembro m on m.familia_id = f.id
group by f.id, f.nombre, f.codigo
order by f.creada_en;
