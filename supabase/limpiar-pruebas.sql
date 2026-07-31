-- ============================================================
--  Limpiar los recetarios de prueba
--
--  Los creó scripts/prueba-permisos.mjs al comprobar los permisos.
--  Llevan códigos ROMAN-… y YAYA-… y no contienen nada tuyo.
--
--  OJO: borrar un recetario se lleva por delante sus recetas, sus
--  variantes y sus miembros. Por eso esto solo toca los de prueba,
--  identificados por su código, y no por su nombre.
-- ============================================================


-- ------------------------------------------------------------
--  1. ANTES: todo lo que hay
--
--  Mira esta tabla. Lo que se va a borrar sale marcado.
-- ------------------------------------------------------------
select
  f.nombre,
  f.codigo,
  (select count(*) from public.receta r where r.familia_id = f.id) as recetas,
  (select count(*) from public.miembro m where m.familia_id = f.id) as miembros,
  case
    when f.codigo like 'ROMAN-%' or f.codigo like 'YAYA-%'
      then '>>> SE BORRA (prueba)'
    else 'se queda'
  end as que_pasa
from public.familia f
order by f.creada_en;


-- ------------------------------------------------------------
--  2. El borrado
-- ------------------------------------------------------------
begin;

delete from public.familia
where codigo like 'ROMAN-%'
   or codigo like 'YAYA-%';

commit;


-- ------------------------------------------------------------
--  3. DESPUÉS: lo que queda
--
--  Deberían quedar solo el de mamá y el de la yaya. Si sobra algo
--  más, dímelo y lo quitamos por su código.
-- ------------------------------------------------------------
select
  f.nombre,
  f.codigo,
  (select count(*) from public.receta r where r.familia_id = f.id) as recetas
from public.familia f
order by f.creada_en;
