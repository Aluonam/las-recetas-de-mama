-- ============================================================
--  003 · Fotos y audios privados
--
--  QUÉ CAMBIA
--
--  Hasta ahora el bucket era público: bastaba con conocer la
--  dirección de una foto para verla, aunque no tuvieras cuenta.
--  Las direcciones llevan un identificador aleatorio y no se pueden
--  adivinar, pero se pueden compartir, reenviar o quedar guardadas
--  en el historial de cualquiera.
--
--  A partir de aquí no hay direcciones permanentes. Cada foto y cada
--  audio se piden con la sesión abierta, y el servidor devuelve un
--  enlace firmado que caduca en una hora. Sin estar invitado no se
--  obtiene ese enlace, y uno viejo deja de funcionar solo.
--
--  Ejecutar DESPUÉS de 002-lista-de-invitados.sql.
-- ============================================================

begin;

-- El bucket deja de ser público.
update storage.buckets
set public = false
where id = 'recetas';

-- Ver un archivo pasa a exigir sesión y estar en la lista.
drop policy if exists recetas_ver on storage.objects;

create policy recetas_ver on storage.objects
  for select to authenticated
  using (bucket_id = 'recetas' and public.es_de_la_familia());

commit;

-- Comprobación: la columna `public` debe salir en false.
select id, name, public
from storage.buckets
where id = 'recetas';
