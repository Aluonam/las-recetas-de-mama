-- ============================================================
--  006 · Poner el almacén en privado
--
--  POR QUÉ EXISTE ESTE ARCHIVO
--
--  El 003 ya hacía esto, pero además reescribía las reglas de las
--  fotos con el modelo antiguo, el de la lista de invitados. Pasarlo
--  DESPUÉS del 004 desharía la separación por recetarios.
--
--  Este solo cambia el interruptor del almacén y no toca ninguna
--  regla, así que se puede ejecutar en cualquier momento y las veces
--  que haga falta.
--
--  QUÉ CAMBIA
--
--  Un almacén público sirve los archivos por una dirección fija que
--  no pregunta quién eres. Cerrado, cada foto y cada audio se piden
--  con la sesión abierta y el enlace caduca en una hora.
-- ============================================================

update storage.buckets
set public = false
where id = 'recetas';

-- Comprobación: debe salir false.
select id, name, public
from storage.buckets
where id = 'recetas';
