-- ============================================================
--  007 · Mensajes de error en condiciones
--
--  Los mensajes de las funciones se escribieron sin tildes por una
--  precaución con la codificación que resultó innecesaria:
--  PostgreSQL trabaja en UTF-8 y no tiene ningún problema con ellas.
--  Quedaban «codigo», «esta» y «sesion», que se leen mal.
--
--  Y el aviso de código incorrecto pasa a decir qué hacer, no solo
--  que algo falla.
--
--  ADEMÁS ARREGLA UN FALLO REAL DEL 004 Y EL 005
--
--  «column reference "codigo" is ambiguous». Las funciones declaran
--  que devuelven una columna llamada `codigo`, y dentro consultan una
--  tabla que también tiene una columna `codigo`. PostgreSQL no sabe a
--  cuál se refiere uno y se planta.
--
--  Con el 004 y el 005 puestos, ni crear un recetario ni entrar con
--  un código funcionaban. Aquí se resuelve poniéndole un alias a la
--  tabla y diciendo siempre de quién es cada columna.
--
--  Ejecutar DESPUÉS de 005.
-- ============================================================

begin;

-- ------------------------------------------------------------
--  Entrar con el código familiar
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
    raise exception 'Hay que iniciar sesión para entrar en un recetario.';
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
    -- Mismo mensaje siempre, exista o no el recetario: si dijera cuál
    -- de las dos cosas es, se podrían probar códigos para averiguar
    -- cuáles existen.
    raise exception
      'Vuelve a consultar tu código familiar, el que has introducido es erróneo.';
  end if;

  insert into public.miembro (familia_id, usuario_id, correo)
  values (v_familia.id, auth.uid(), auth.jwt() ->> 'email')
  on conflict (familia_id, usuario_id) do nothing;

  return query select v_familia.id, v_familia.nombre, v_familia.codigo;
end;
$$;

-- ------------------------------------------------------------
--  Crear un recetario
-- ------------------------------------------------------------
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
    raise exception 'Hay que iniciar sesión para crear un recetario.';
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
  values (v_id, auth.uid(), auth.jwt() ->> 'email');

  return query select v_id, trim(p_nombre), v_codigo;
end;
$$;

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

  v_codigo := upper(trim(p_codigo));

  if length(v_codigo) < 5 then
    raise exception 'El código necesita al menos 5 caracteres.';
  end if;

  if length(v_codigo) > 32 then
    raise exception 'El código no puede pasar de 32 caracteres.';
  end if;

  if v_codigo !~ '^[A-Z0-9-]+$' then
    raise exception
      'El código solo admite letras sin tilde, números y guiones.';
  end if;

  if exists (
    select 1 from public.familia f
    where f.codigo = v_codigo and f.id <> p_familia_id
  ) then
    raise exception
      'Ese código ya lo está usando otra familia. Prueba con otro.';
  end if;

  update public.familia f set codigo = v_codigo where f.id = p_familia_id;
  return v_codigo;
end;
$$;

-- ------------------------------------------------------------
--  Generar uno al azar
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
  update public.familia f set codigo = v_codigo where f.id = p_familia_id;
  return v_codigo;
end;
$$;

commit;

-- Comprobación: debe salir el mensaje nuevo, con tildes.
select 'Listo. Prueba a entrar con un código inventado y leerás:' as nota,
       'Vuelve a consultar tu código familiar, el que has introducido es erróneo.'
       as mensaje;
