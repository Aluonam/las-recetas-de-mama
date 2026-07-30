-- ============================================================
--  008 · Entrar sin enlace por correo
--
--  QUÉ CAMBIA
--
--  Hasta ahora entrar exigía pedir un enlace, ir al buzón y volver.
--  Para un recetario que se abre con las manos llenas de harina eso
--  es un peaje demasiado caro.
--
--  A partir de aquí la sesión se crea sola, sin correo ni contraseña,
--  y la llave pasa a ser únicamente el código familiar.
--
--  El correo se sigue pidiendo, pero cambia de papel: ya no
--  identifica a nadie, solo queda anotado para saber quién metió cada
--  receta. Es una etiqueta, no una credencial.
--
--  ANTES DE EJECUTAR ESTO hay que activar en el panel de Supabase:
--    Authentication → Providers → Anonymous sign-ins
--  Sin eso, la app no podrá crear la sesión y no entrará nadie.
--
--  Ejecutar DESPUÉS de 007.
-- ============================================================

begin;

-- Las versiones anteriores sacaban el correo de la sesión. Una sesión
-- anónima no lo lleva, así que ahora se recibe como argumento. Se
-- retiran las viejas para que no queden dos funciones con el mismo
-- nombre y PostgreSQL no tenga que adivinar cuál se llama.
drop function if exists public.crear_recetario(text, text);
drop function if exists public.unirse_con_codigo(text);

-- ------------------------------------------------------------
--  Entrar con el código familiar
-- ------------------------------------------------------------
create or replace function public.unirse_con_codigo(
  p_codigo text,
  p_correo text default null
)
returns table (id uuid, nombre text, codigo text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_familia public.familia%rowtype;
begin
  if auth.uid() is null then
    raise exception 'No se ha podido abrir la sesión. Recarga la página.';
  end if;

  -- El alias `f` no es cosmético: sin él, `codigo` podría ser la
  -- columna de la tabla o la que esta función declara que devuelve, y
  -- PostgreSQL se niega a adivinar.
  select * into v_familia
  from public.familia f
  -- Sin distinguir mayúsculas ni espacios sobrantes: el código llega
  -- copiado de un WhatsApp y nadie lo pega limpio.
  where upper(trim(f.codigo)) = upper(trim(p_codigo));

  if not found then
    -- Mismo mensaje exista o no el recetario: si distinguiera, se
    -- podrían probar códigos para averiguar cuáles existen.
    raise exception
      'Vuelve a consultar tu código familiar, el que has introducido es erróneo.';
  end if;

  insert into public.miembro (familia_id, usuario_id, correo)
  values (v_familia.id, auth.uid(), nullif(trim(p_correo), ''))
  -- Si ya era miembro y vuelve a entrar desde otro sitio, se aprovecha
  -- para poner al día el correo con el que se ha presentado.
  on conflict (familia_id, usuario_id) do update
    set correo = coalesce(excluded.correo, public.miembro.correo);

  return query select v_familia.id, v_familia.nombre, v_familia.codigo;
end;
$$;

grant execute on function public.unirse_con_codigo(text, text) to authenticated;

-- ------------------------------------------------------------
--  Crear un recetario
-- ------------------------------------------------------------
create or replace function public.crear_recetario(
  p_nombre text,
  p_codigo text default null,
  p_correo text default null
)
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
    raise exception 'No se ha podido abrir la sesión. Recarga la página.';
  end if;

  if coalesce(trim(p_nombre), '') = '' then
    raise exception 'El recetario necesita un nombre.';
  end if;

  if coalesce(trim(p_codigo), '') = '' then
    v_codigo := public.generar_codigo();
  else
    v_codigo := upper(trim(p_codigo));

    if length(v_codigo) < 5 or length(v_codigo) > 32 then
      raise exception 'El código necesita entre 5 y 32 caracteres.';
    end if;

    if v_codigo !~ '^[A-Z0-9-]+$' then
      raise exception
        'El código solo admite letras sin tilde, números y guiones.';
    end if;

    if exists (
      select 1 from public.familia f where f.codigo = v_codigo
    ) then
      raise exception
        'Ese código ya lo está usando otra familia. Prueba con otro.';
    end if;
  end if;

  insert into public.familia (nombre, codigo, creada_por)
  values (trim(p_nombre), v_codigo, auth.uid())
  returning familia.id into v_id;

  insert into public.miembro (familia_id, usuario_id, correo)
  values (v_id, auth.uid(), nullif(trim(p_correo), ''));

  return query select v_id, trim(p_nombre), v_codigo;
end;
$$;

grant execute on function public.crear_recetario(text, text, text) to authenticated;

commit;

-- ------------------------------------------------------------
--  Quién ha entrado a cada recetario
--
--  Con esto se ve el registro que querías: qué correo dijo cada
--  persona y cuándo entró.
-- ------------------------------------------------------------
select f.nombre as recetario, m.correo, m.unido_en
from public.miembro m
join public.familia f on f.id = m.familia_id
order by f.nombre, m.unido_en;
