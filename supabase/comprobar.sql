-- ============================================================
--  Comprobación de la instalación
--
--  NO CAMBIA NADA. Solo mira y da un parte.
--
--  Pega esto en SQL Editor → Run. Dice qué archivos están
--  aplicados y cuáles faltan, sin tener que acordarse de nada.
-- ============================================================

with pruebas as (

  -- ---------- schema.sql ----------
  select 1 as orden, 'schema' as archivo,
    'Tabla de recetas' as comprueba,
    to_regclass('public.receta') is not null as bien

  union all select 2, 'schema',
    'Tabla de variantes',
    to_regclass('public.variante') is not null

  union all select 3, 'schema',
    'Recetas protegidas por filas',
    coalesce((select relrowsecurity from pg_class
              where oid = to_regclass('public.receta')), false)

  union all select 4, 'schema',
    'Sin sesion no se ve nada',
    not has_table_privilege('anon', 'public.receta', 'SELECT')

  union all select 5, 'schema',
    'Con sesion si se ve',
    has_table_privilege('authenticated', 'public.receta', 'SELECT')

  union all select 6, 'schema',
    'Almacen de fotos creado',
    exists (select 1 from storage.buckets where id = 'recetas')

  -- ---------- 003 ----------
  union all select 7, '003',
    'Fotos y audios PRIVADOS',
    coalesce((select not public from storage.buckets
              where id = 'recetas'), false)

  -- ---------- 004 ----------
  union all select 8, '004',
    'Tabla de recetarios',
    to_regclass('public.familia') is not null

  union all select 9, '004',
    'Tabla de miembros',
    to_regclass('public.miembro') is not null

  union all select 10, '004',
    'Las recetas saben de que casa son',
    exists (select 1 from information_schema.columns
            where table_schema = 'public' and table_name = 'receta'
              and column_name = 'familia_id')

  union all select 11, '004',
    'Funcion mis_recetarios',
    exists (select 1 from pg_proc p
            join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'public' and p.proname = 'mis_recetarios')

  union all select 12, '004',
    'Las politicas miran el recetario',
    exists (select 1 from pg_policies
            where schemaname = 'public' and tablename = 'receta'
              and qual like '%mis_recetarios%')

  union all select 13, '004',
    'Las fotos se separan por recetario',
    exists (select 1 from pg_policies
            where schemaname = 'storage' and tablename = 'objects'
              and policyname = 'recetas_ver'
              and qual like '%mis_recetarios%')

  union all select 14, '004',
    'La lista de correos es ilegible desde fuera',
    not has_table_privilege('authenticated', 'public.miembro', 'SELECT')

  -- ---------- 005 ----------
  union all select 15, '005',
    'Se puede elegir el codigo a mano',
    exists (select 1 from pg_proc p
            join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'public' and p.proname = 'establecer_codigo')

  union all select 16, '005',
    'Crear recetario acepta codigo propio',
    exists (select 1 from pg_proc p
            join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'public' and p.proname = 'crear_recetario'
              and p.pronargs = 2)
)

select
  case when bien then 'OK' else 'FALTA' end as estado,
  archivo,
  comprueba
from pruebas
order by orden;


-- ------------------------------------------------------------
--  Resumen: qué archivos están aplicados
-- ------------------------------------------------------------
select
  case
    when to_regclass('public.receta') is null then 'NADA. Empieza por schema.sql'
    when to_regclass('public.familia') is null then 'Hasta schema.sql (y quiza 002). Falta 004'
    when not exists (select 1 from pg_proc p
                     join pg_namespace n on n.oid = p.pronamespace
                     where n.nspname = 'public'
                       and p.proname = 'establecer_codigo')
      then 'Hasta 004. Falta 005 (elegir el codigo a mano)'
    else 'Todo aplicado: schema, 003, 004 y 005'
  end as hasta_donde_llegas,
  coalesce((select case when not public then 'privado' else 'PUBLICO - falta pasar 003' end
            from storage.buckets where id = 'recetas'), 'sin almacen') as estado_de_las_fotos;


-- ------------------------------------------------------------
--  Los recetarios que existen ahora mismo
-- ------------------------------------------------------------
select
  f.nombre,
  f.codigo,
  count(m.usuario_id) as miembros,
  (select count(*) from public.receta r where r.familia_id = f.id) as recetas
from public.familia f
left join public.miembro m on m.familia_id = f.id
group by f.id, f.nombre, f.codigo
order by f.creada_en;
