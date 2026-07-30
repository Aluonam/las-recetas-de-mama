-- ============================================================
--  009 · Borrar solo quien creó el recetario
--
--  QUÉ CAMBIA
--
--  Hasta ahora podía borrar una receta quien la hubiera escrito. A
--  partir de aquí solo puede borrar quien creó el recetario, y puede
--  borrar cualquiera, sea de quien sea.
--
--  El resto de la familia sigue pudiendo verlo y editarlo todo. Lo
--  único que pierden es la posibilidad de hacer desaparecer algo.
--
--  Y es la decisión correcta para lo que esto es: una receta borrada
--  por error no se recupera, y el valor de este recetario está
--  precisamente en que nada se pierda.
--
--  La regla vive aquí y no en el botón de la pantalla. Esconder un
--  botón no impide nada a quien sepa escribir una petición a mano.
--
--  Ejecutar DESPUÉS de 008.
-- ============================================================

begin;

drop policy if exists receta_borrar on public.receta;

create policy receta_borrar on public.receta
  for delete to authenticated
  using (
    exists (
      select 1
      from public.familia f
      where f.id = receta.familia_id
        and f.creada_por = auth.uid()
    )
  );

commit;

-- ------------------------------------------------------------
--  Quién puede borrar en cada recetario
-- ------------------------------------------------------------
select
  f.nombre as recetario,
  m.correo as puede_borrar,
  m.unido_en
from public.familia f
join public.miembro m
  on m.familia_id = f.id and m.usuario_id = f.creada_por
order by f.nombre;
