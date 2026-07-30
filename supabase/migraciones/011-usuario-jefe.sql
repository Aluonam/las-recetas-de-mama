-- ============================================================
--  011 · El usuario jefe
--
--  EL PROBLEMA
--
--  Quien crea un recetario queda anotado en familia.creada_por, y es
--  el único que puede borrar recetas. Eso ya funcionaba.
--
--  Lo que fallaba es de quién era esa identidad: una sesión anónima
--  que vive en un navegador. Al pulsar Salir, borrar el historial o
--  abrir la app en la tablet, para la base eras otra persona y
--  perdías el mando de tu propio recetario.
--
--  La solución no está aquí sino en la app: quien administra ancla su
--  cuenta a un correo y desde entonces puede demostrar quién es desde
--  cualquier sitio. Este archivo aporta lo que hace falta en la base:
--  poder consultar quién manda, y poder traspasar el mando.
--
--  Ejecutar DESPUÉS de 010.
-- ============================================================

begin;

-- ------------------------------------------------------------
--  ¿Manda quien pregunta en este recetario?
--
--  La app la usa para decidir si enseña el botón de borrar. La regla
--  de verdad sigue estando en la política de borrado: esto solo evita
--  enseñar un botón que iba a fallar.
-- ------------------------------------------------------------
create or replace function public.soy_jefe(p_familia_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.familia f
    where f.id = p_familia_id and f.creada_por = auth.uid()
  );
$$;

grant execute on function public.soy_jefe(uuid) to authenticated;

-- ------------------------------------------------------------
--  Traspasar el mando
--
--  Solo puede hacerlo quien manda ahora, y solo a alguien que ya sea
--  miembro del recetario. Sirve para dos cosas: recuperar el mando
--  cuando se quedó en una sesión anónima perdida, y dejárselo a otra
--  persona.
-- ------------------------------------------------------------
create or replace function public.traspasar_mando(
  p_familia_id uuid,
  p_correo     text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_destino uuid;
begin
  if not exists (
    select 1 from public.familia f
    where f.id = p_familia_id and f.creada_por = auth.uid()
  ) then
    raise exception 'Solo puede traspasar el mando quien lo tiene ahora.';
  end if;

  select m.usuario_id into v_destino
  from public.miembro m
  where m.familia_id = p_familia_id
    and lower(m.correo) = lower(trim(p_correo))
  order by m.unido_en
  limit 1;

  if v_destino is null then
    raise exception
      'Esa persona todavía no ha entrado en el recetario con ese correo.';
  end if;

  update public.familia f
  set creada_por = v_destino
  where f.id = p_familia_id;

  return trim(p_correo);
end;
$$;

grant execute on function public.traspasar_mando(uuid, text) to authenticated;

commit;

-- ------------------------------------------------------------
--  Quién manda en cada recetario, ahora mismo
-- ------------------------------------------------------------
select
  f.nombre           as recetario,
  u.email            as correo_del_jefe,
  u.is_anonymous     as cuenta_anonima,
  case when u.is_anonymous
       then 'FRAGIL: se pierde al salir o cambiar de dispositivo'
       else 'anclada a un correo'
  end                as aviso
from public.familia f
left join auth.users u on u.id = f.creada_por
order by f.creada_en;


-- ============================================================
--  ARREGLO PARA UN MANDO PERDIDO
--
--  Si arriba sale «FRAGIL», el recetario pertenece a una sesión
--  anónima que ya no puedes recuperar. Descomenta esto, pon tu
--  correo, y el mando pasa a tu cuenta de verdad.
--
--  Va aquí y no en la app a propósito: traspasar el mando saltándose
--  las comprobaciones solo debería poder hacerse desde el panel de
--  la base, y tras haberlo pensado.
-- ============================================================
-- with cuenta as (
--   select id, email from auth.users where email = 'TU-CORREO@ejemplo.com'
-- )
-- update public.familia f
-- set creada_por = (select id from cuenta)
-- where f.nombre = 'Las recetas de mamá';
--
-- -- Y que esa cuenta conste como miembro:
-- insert into public.miembro (familia_id, usuario_id, correo)
-- select f.id, u.id, u.email
-- from public.familia f, auth.users u
-- where f.nombre = 'Las recetas de mamá'
--   and u.email = 'TU-CORREO@ejemplo.com'
-- on conflict (familia_id, usuario_id) do nothing;
