-- ============================================================
--  010 · Poder escribir a quien administra el recetario
--
--  PARA QUÉ
--
--  Si alguien de la familia necesita algo —que le borren una receta
--  que subió mal, que le vuelvan a pasar el código— tiene que poder
--  avisar a quien lo administra.
--
--  La tabla de miembros está cerrada a cal y canto, así que nadie
--  puede consultar ese correo por su cuenta. Esta función lo
--  devuelve, y solo a quien ya pertenece a ese recetario.
--
--  Ejecutar DESPUÉS de 009.
-- ============================================================

begin;

create or replace function public.administrador_del_recetario(
  p_familia_id uuid
)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select m.correo
  from public.familia f
  join public.miembro m
    on m.familia_id = f.id and m.usuario_id = f.creada_por
  where f.id = p_familia_id
    -- Solo contesta a quien ya está dentro de ese recetario. Sin esto,
    -- cualquiera podría ir preguntando por identificadores y recoger
    -- correos de familias ajenas.
    and exists (
      select 1
      from public.miembro yo
      where yo.familia_id = p_familia_id
        and yo.usuario_id = auth.uid()
    );
$$;

grant execute on function public.administrador_del_recetario(uuid) to authenticated;

commit;

-- Comprobación: quién administra cada recetario.
select f.nombre as recetario, m.correo as administra
from public.familia f
join public.miembro m
  on m.familia_id = f.id and m.usuario_id = f.creada_por
order by f.nombre;
