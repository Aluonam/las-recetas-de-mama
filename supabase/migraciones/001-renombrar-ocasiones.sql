-- ============================================================
--  001 · Renombrar y retirar ocasiones
--
--  Los filtros del recetario se construyen con las ocasiones que
--  llevan las recetas, no con una lista fija. Cambiar las sugerencias
--  del formulario no arregla lo ya escrito: hay que tocar los datos.
--
--  Ejecutar una sola vez en Supabase → SQL Editor → Run.
--  Solo hace falta si ya tienes recetas guardadas en la base; en modo
--  demostración la app se migra sola al abrirla.
-- ============================================================

begin;

-- «Del diario» pasa a «De diario»
update public.receta
set ocasiones = array_replace(ocasiones, 'Del diario', 'De diario')
where 'Del diario' = any (ocasiones);

-- «Cuando alguien está malo» pasa a «Enfermitos»
update public.receta
set ocasiones = array_replace(ocasiones, 'Cuando alguien está malo', 'Enfermitos')
where 'Cuando alguien está malo' = any (ocasiones);

-- «Navidad» se retira: Nochebuena ya cubre esas fechas y tener las dos
-- duplicaba el filtro.
update public.receta
set ocasiones = array_remove(ocasiones, 'Navidad')
where 'Navidad' = any (ocasiones);

-- Por si alguna receta acabó con la misma ocasión repetida.
update public.receta
set ocasiones = (
  select coalesce(array_agg(distinct o order by o), '{}')
  from unnest(ocasiones) as o
)
where array_length(ocasiones, 1) is not null;

commit;

-- Comprobación: lista las ocasiones que quedan y cuántas recetas usan
-- cada una. No debería aparecer ninguna de las tres retiradas.
select o as ocasion, count(*) as recetas
from public.receta, unnest(ocasiones) as o
group by o
order by o;
