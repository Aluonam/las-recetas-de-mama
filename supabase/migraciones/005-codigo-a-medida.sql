-- ============================================================
--  005 · Elegir el código a mano
--
--  El 004 generaba los códigos y no dejaba elegirlos. Se puede
--  querer uno propio, más fácil de recordar y de dictar.
--
--  SOBRE LA SEGURIDAD DE UN CÓDIGO ELEGIDO
--
--  El código es lo único que separa vuestro recetario del resto de
--  internet. Uno generado como MEMBRILLO-4821 sale de unas 180.000
--  combinaciones; una palabra suelta que alguien pueda imaginar,
--  de muchas menos.
--
--  Por eso aquí se exige un mínimo de cinco caracteres y se
--  recomienda meter un número. No es paranoia: cualquiera puede
--  escribir un programa que pruebe códigos uno detrás de otro.
--
--  Ejecutar DESPUÉS de 004.
-- ============================================================

begin;

-- ------------------------------------------------------------
--  Poner un código concreto
-- ------------------------------------------------------------
create or replace function public.establecer_codigo(
  p_familia_id uuid,
  p_codigo     text
)
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

  -- Se guarda siempre en mayúsculas y sin espacios: al entrar se
  -- compara igual, así que da lo mismo cómo lo escriba cada uno.
  v_codigo := upper(trim(p_codigo));

  if length(v_codigo) < 5 then
    raise exception 'El codigo necesita al menos 5 caracteres.';
  end if;

  if length(v_codigo) > 32 then
    raise exception 'El codigo no puede pasar de 32 caracteres.';
  end if;

  -- Sin acentos, eñes ni espacios: el código se dicta por teléfono y
  -- se teclea en una tablet. Todo lo que se pueda escribir de dos
  -- maneras distintas acaba en «pues a mí no me entra».
  if v_codigo !~ '^[A-Z0-9-]+$' then
    raise exception
      'El codigo solo admite letras sin tilde, numeros y guiones.';
  end if;

  if exists (
    select 1 from public.familia
    where codigo = v_codigo and id <> p_familia_id
  ) then
    raise exception 'Ese codigo ya lo esta usando otra familia. Prueba otro.';
  end if;

  update public.familia set codigo = v_codigo where id = p_familia_id;
  return v_codigo;
end;
$$;

grant execute on function public.establecer_codigo(uuid, text) to authenticated;

-- ------------------------------------------------------------
--  Crear el recetario eligiendo ya el código
--
--  Se retira la versión de un solo argumento para que no queden dos
--  funciones con el mismo nombre y PostgreSQL no tenga que adivinar
--  cuál se está llamando.
-- ------------------------------------------------------------
drop function if exists public.crear_recetario(text);

create or replace function public.crear_recetario(
  p_nombre text,
  p_codigo text default null
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
    raise exception 'Hay que iniciar sesion para crear un recetario.';
  end if;

  if coalesce(trim(p_nombre), '') = '' then
    raise exception 'El recetario necesita un nombre.';
  end if;

  -- Sin código propio se genera uno. Con código, se valida igual que
  -- en establecer_codigo, para no tener dos varas de medir.
  if coalesce(trim(p_codigo), '') = '' then
    v_codigo := public.generar_codigo();
  else
    v_codigo := upper(trim(p_codigo));

    if length(v_codigo) < 5 or length(v_codigo) > 32 then
      raise exception 'El codigo necesita entre 5 y 32 caracteres.';
    end if;

    if v_codigo !~ '^[A-Z0-9-]+$' then
      raise exception
        'El codigo solo admite letras sin tilde, numeros y guiones.';
    end if;

    if exists (select 1 from public.familia where codigo = v_codigo) then
      raise exception 'Ese codigo ya lo esta usando otra familia. Prueba otro.';
    end if;
  end if;

  insert into public.familia (nombre, codigo, creada_por)
  values (trim(p_nombre), v_codigo, auth.uid())
  returning familia.id into v_id;

  insert into public.miembro (familia_id, usuario_id, correo)
  values (v_id, auth.uid(), auth.jwt() ->> 'email');

  return query select v_id, trim(p_nombre), v_codigo;
end;
$$;

grant execute on function public.crear_recetario(text, text) to authenticated;

commit;

-- ------------------------------------------------------------
--  Si ya tienes recetario y quieres ponerle un código concreto,
--  hazlo desde la portada de la app. También se puede aquí:
-- ------------------------------------------------------------
-- select public.establecer_codigo(
--   (select id from public.familia limit 1),
--   'ROGELIO24'
-- );
