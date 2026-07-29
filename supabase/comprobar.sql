-- ============================================================
--  Comprobación de la instalación
--
--  Ejecuta esto en SQL Editor DESPUÉS de haber pasado, en orden:
--    1. schema.sql
--    2. migraciones/002-lista-de-invitados.sql
--    3. migraciones/003-fotos-y-audios-privados.sql
--
--  No cambia nada: solo mira y da un parte. Todas las filas deben
--  salir con OK. La columna «qué hacer» dice qué falta si no.
-- ============================================================

with pruebas as (

  -- ---------- Las tablas ----------
  select 1 as orden,
    'Tabla de recetas' as comprueba,
    to_regclass('public.receta') is not null as bien,
    'Pasa schema.sql' as que_hacer

  union all select 2,
    'Tabla de variantes',
    to_regclass('public.variante') is not null,
    'Pasa schema.sql'

  union all select 3,
    'Tabla de invitados',
    to_regclass('public.invitado') is not null,
    'Pasa migraciones/002'

  -- ---------- La protección por filas ----------
  union all select 4,
    'Recetas protegidas por filas',
    coalesce((select relrowsecurity from pg_class
              where oid = to_regclass('public.receta')), false),
    'Pasa schema.sql'

  union all select 5,
    'Variantes protegidas por filas',
    coalesce((select relrowsecurity from pg_class
              where oid = to_regclass('public.variante')), false),
    'Pasa schema.sql'

  union all select 6,
    'Invitados protegidos por filas',
    coalesce((select relrowsecurity from pg_class
              where oid = to_regclass('public.invitado')), false),
    'Pasa migraciones/002'

  -- ---------- Las políticas ----------
  union all select 7,
    'Recetas con sus cuatro políticas',
    (select count(*) from pg_policies
     where schemaname = 'public' and tablename = 'receta') = 4,
    'Pasa schema.sql y luego migraciones/002'

  union all select 8,
    'La lista de invitados manda',
    exists (select 1 from pg_proc p
            join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'public' and p.proname = 'es_de_la_familia'),
    'Pasa migraciones/002'

  union all select 9,
    'Las políticas consultan la lista',
    exists (select 1 from pg_policies
            where schemaname = 'public' and tablename = 'receta'
              and qual like '%es_de_la_familia%'),
    'Pasa migraciones/002 DESPUÉS de schema.sql'

  -- ---------- Los permisos ----------
  union all select 10,
    'Sin sesión no se ve nada',
    not has_table_privilege('anon', 'public.receta', 'SELECT'),
    'Pasa schema.sql (versión actual, con los permisos)'

  union all select 11,
    'Con sesión sí se ve',
    has_table_privilege('authenticated', 'public.receta', 'SELECT'),
    'Pasa schema.sql (versión actual, con los permisos)'

  union all select 12,
    'La lista de correos es ilegible desde fuera',
    not has_table_privilege('authenticated', 'public.invitado', 'SELECT'),
    'Pasa migraciones/002'

  -- ---------- El almacén ----------
  union all select 13,
    'Almacén de fotos y audios creado',
    exists (select 1 from storage.buckets where id = 'recetas'),
    'Pasa schema.sql'

  union all select 14,
    'Fotos y audios privados',
    coalesce((select not public from storage.buckets
              where id = 'recetas'), false),
    'Pasa migraciones/003'

  -- ---------- La familia ----------
  union all select 15,
    'Hay alguien invitado',
    coalesce((select count(*) > 0 from public.invitado), false),
    'Añade correos al final de migraciones/002 y vuelve a pasarlo'
)

select
  case when bien then 'OK' else 'FALTA' end as estado,
  comprueba,
  case when bien then '' else que_hacer end as que_hacer
from pruebas
order by orden;

-- ------------------------------------------------------------
--  Y quién puede entrar ahora mismo
-- ------------------------------------------------------------
select correo, nombre, invitado_en
from public.invitado
order by invitado_en;
