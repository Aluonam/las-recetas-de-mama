-- ============================================================
--  014. Notas de voz pegadas a cada apartado de la receta
--
--  Ya había un audio por receta: el de quien se sienta y la cuenta
--  entera. Pero no es así como se cuenta una receta en una cocina.
--  Lo que sale son avisos sueltos, dichos justo cuando toca:
--
--    «Las manzanas tienen que quedar rectas por la base,
--     para que se asienten en el plato.»
--
--  Eso escrito se pierde, porque nadie se para a escribirlo. Dicho,
--  dura diez segundos. Así que cada apartado —ingredientes,
--  elaboración, trucos, por qué es especial, de quién viene— admite
--  las suyas.
--
--  Se guardan en una columna JSONB y no en una tabla aparte por lo
--  mismo que los ingredientes: viajan siempre con la receta, se
--  editan con ella y nadie va a consultar «todos los audios de
--  trucos del recetario». Una tabla solo añadiría un join.
--
--  Cada entrada es:
--    { "id": "...", "apartado": "trucos",
--      "url": "familia/audios/xxx.webm", "nota": "lo de la base" }
--
--  La `url` es la ruta dentro del bucket privado, igual que las
--  fotos: el bucket no tiene direcciones permanentes y cada vez que
--  hay que oír el audio se pide un enlace firmado.
--
--  SIN RIESGO: solo añade una columna con valor por defecto. Las
--  recetas que ya existen se quedan con la lista vacía.
-- ============================================================

alter table public.receta
  add column if not exists audios jsonb not null default '[]'::jsonb;

comment on column public.receta.audios is
  'Notas de voz por apartado: [{id, apartado, url, nota}]. La url es '
  'la ruta en el bucket «recetas», no una dirección.';


-- ------------------------------------------------------------
--  Comprobación
-- ------------------------------------------------------------
select
  column_name,
  data_type,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'receta'
  and column_name = 'audios';
