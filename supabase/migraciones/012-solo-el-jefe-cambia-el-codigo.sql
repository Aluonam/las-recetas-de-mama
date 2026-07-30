-- ============================================================
--  012 · Cambiar el código, solo quien manda
--
--  QUÉ CAMBIA
--
--  Cambiar el código deja fuera a quien todavía no lo tenga: el
--  viejo deja de servir. Es una decisión que afecta a toda la
--  familia, así que no debería poder tomarla cualquiera.
--
--  Hasta ahora bastaba con ser miembro. La pantalla ya esconde esos
--  botones a quien no administra, pero esconder un botón no impide
--  nada a quien sepa escribir una petición a mano. La regla tiene que
--  estar aquí.
--
--  Compartir el código lo sigue pudiendo hacer cualquiera: para eso
--  está el botón de copiar la invitación, que no cambia nada.
--
--  Ejecutar DESPUÉS de 011.
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
    select 1 from public.familia f
    where f.id = p_familia_id and f.creada_por = auth.uid()
  ) then
    raise exception 'Solo puede cambiar el código quien creó el recetario.';
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
    select 1 from public.familia f
    where f.id = p_familia_id and f.creada_por = auth.uid()
  ) then
    raise exception 'Solo puede cambiar el código quien creó el recetario.';
  end if;

  v_codigo := public.generar_codigo();
  update public.familia f set codigo = v_codigo where f.id = p_familia_id;
  return v_codigo;
end;
$$;

commit;

select 'Listo. Cambiar el código pasa a ser solo de quien creó el recetario.' as nota;
