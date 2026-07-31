-- ============================================================
--  013 · Recuperar el mando de un recetario
--
--  PARA QUÉ
--
--  Quien crea un recetario queda anotado como su jefe, y es el único
--  que puede borrar recetas. Si ese recetario se creó desde una
--  sesión anónima que luego se perdió —al salir, al borrar el
--  historial, o de aquellos días en que se creaban sesiones de más—,
--  el mando se quedó en una cuenta a la que ya no se puede volver.
--
--  Esto lo devuelve a tu cuenta verificada.
--
--  QUÉ TOCA Y QUÉ NO
--
--  Solo cambia recetarios que cumplan LAS DOS cosas:
--    - eres miembro
--    - quien manda ahora es una cuenta anónima
--
--  Un recetario cuyo jefe tenga correo no se toca: ese sí tiene
--  dueño localizable, y no sería tuyo.
--
--  Va aquí y no en la app a propósito: saltarse las comprobaciones
--  para cambiar de dueño solo debería hacerse desde el panel de la
--  base y habiéndolo pensado.
-- ============================================================


-- ============================================================
--  1. PON AQUÍ TU CORREO  (el que verificaste en Ajustes)
-- ============================================================
-- Sustituye TU-CORREO@ejemplo.com en los tres sitios de abajo.


-- ------------------------------------------------------------
--  2. ANTES: cómo está la cosa
-- ------------------------------------------------------------
select
  f.nombre                as recetario,
  u.email                 as manda_ahora,
  u.is_anonymous          as cuenta_anonima,
  case when u.is_anonymous then 'se puede rescatar' else 'tiene dueño con correo' end
                          as diagnostico
from public.familia f
left join auth.users u on u.id = f.creada_por
where exists (
  select 1
  from public.miembro m
  join auth.users yo on yo.id = m.usuario_id
  where m.familia_id = f.id
    and lower(yo.email) = lower('TU-CORREO@ejemplo.com')
)
order by f.creada_en;


-- ------------------------------------------------------------
--  3. EL RESCATE
-- ------------------------------------------------------------
begin;

update public.familia f
set creada_por = (
  select id from auth.users
  where lower(email) = lower('TU-CORREO@ejemplo.com')
  limit 1
)
where
  -- eres miembro
  exists (
    select 1
    from public.miembro m
    join auth.users yo on yo.id = m.usuario_id
    where m.familia_id = f.id
      and lower(yo.email) = lower('TU-CORREO@ejemplo.com')
  )
  -- y quien manda ahora es una cuenta anónima
  and exists (
    select 1 from auth.users due
    where due.id = f.creada_por and due.is_anonymous
  );

commit;


-- ------------------------------------------------------------
--  4. DESPUÉS: comprobación
--
--  Todos los tuyos deben salir con tu correo y cuenta_anonima en
--  false. Si es así, al recargar la app tendrás el botón de borrar
--  en todos ellos.
-- ------------------------------------------------------------
select
  f.nombre       as recetario,
  u.email        as manda_ahora,
  u.is_anonymous as cuenta_anonima
from public.familia f
left join auth.users u on u.id = f.creada_por
order by f.creada_en;
