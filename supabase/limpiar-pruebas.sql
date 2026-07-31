-- ============================================================
--  Limpieza: recetarios de prueba y cuentas huérfanas
--
--  Dos cosas, en este orden:
--    1. Los recetarios de prueba, por su código:
--         ROMAN-, YAYA-   scripts/prueba-permisos.mjs
--         ABC-            scripts/recetario-abecedario.mjs
--    2. Las sesiones anónimas que no pertenecen a nada
--
--  El orden importa: al borrar un recetario desaparecen también
--  sus miembros, y así queda claro qué cuentas sobran de verdad.
--
--  OJO CON LAS CUENTAS ANÓNIMAS
--
--  La cuenta de quien entra solo con el código TAMBIÉN es anónima:
--  la de tu suegra lo es. Borrar «todas las anónimas» la echaría del
--  recetario.
--
--  Por eso aquí solo se borran las que no pertenecen a ningún
--  recetario ni administran ninguno. Son las que se generaron de más
--  en su día por un fallo que ya está corregido.
-- ============================================================


-- ------------------------------------------------------------
--  1. ANTES: qué recetarios hay
-- ------------------------------------------------------------
select
  f.nombre,
  f.codigo,
  (select count(*) from public.receta r where r.familia_id = f.id) as recetas,
  (select count(*) from public.miembro m where m.familia_id = f.id) as miembros,
  case
    when f.codigo like 'ROMAN-%' or f.codigo like 'YAYA-%'
      or f.codigo like 'ABC-%'
      then '>>> SE BORRA (prueba)'
    else 'se queda'
  end as que_pasa
from public.familia f
order by f.creada_en;


-- ------------------------------------------------------------
--  2. Fuera los recetarios de prueba
--
--  Se lleva por delante sus recetas, variantes y miembros. Por eso
--  el criterio es el código, que no se puede confundir, y no el
--  nombre.
-- ------------------------------------------------------------
begin;

delete from public.familia
where codigo like 'ROMAN-%'
   or codigo like 'YAYA-%'
   or codigo like 'ABC-%';

commit;


-- ------------------------------------------------------------
--  3. Qué cuentas quedan, y cuáles sobran
--
--  Mira esta tabla antes de seguir. Las marcadas son las que se
--  borran en el paso 4.
-- ------------------------------------------------------------
select
  u.email,
  u.is_anonymous                          as anonima,
  u.created_at::date                      as creada,
  (select count(*) from public.miembro m where m.usuario_id = u.id) as recetarios,
  case
    when not u.is_anonymous then 'se queda (tiene correo)'
    when exists (select 1 from public.miembro m where m.usuario_id = u.id)
      then 'se queda (pertenece a un recetario)'
    when exists (select 1 from public.familia f where f.creada_por = u.id)
      then 'se queda (administra un recetario)'
    else '>>> SE BORRA (huerfana)'
  end                                     as que_pasa
from auth.users u
order by u.created_at;


-- ------------------------------------------------------------
--  4. Fuera las cuentas huérfanas
-- ------------------------------------------------------------
begin;

delete from auth.users u
where u.is_anonymous
  and not exists (
    select 1 from public.miembro m where m.usuario_id = u.id
  )
  and not exists (
    select 1 from public.familia f where f.creada_por = u.id
  );

commit;


-- ------------------------------------------------------------
--  5. DESPUÉS: cómo queda todo
-- ------------------------------------------------------------
select 'Recetarios' as que, count(*)::text as cuantos from public.familia
union all
select 'Cuentas', count(*)::text from auth.users
union all
select 'Recetas', count(*)::text from public.receta;

select
  f.nombre,
  f.codigo,
  u.email as administra,
  (select count(*) from public.receta r where r.familia_id = f.id) as recetas,
  (select count(*) from public.miembro m where m.familia_id = f.id) as miembros
from public.familia f
left join auth.users u on u.id = f.creada_por
order by f.creada_en;
