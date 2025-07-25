-- Primeiro verificar quais IDs existem
SELECT 'Destinations existentes:' as info;
SELECT id, name FROM destinations LIMIT 10;

SELECT 'Trips com destination_id inválido:' as info;
SELECT t.id, t.title, t.destination_id 
FROM trips t 
LEFT JOIN destinations d ON t.destination_id = d.id 
WHERE d.id IS NULL;

-- Atualizar trips órfãos para Rio de Janeiro (id = 1)
UPDATE trips 
SET destination_id = 1 
WHERE destination_id NOT IN (SELECT id FROM destinations);

-- Verificar se ainda há órfãos
SELECT 'Trips órfãos após correção:' as info;
SELECT COUNT(*) as count
FROM trips t 
LEFT JOIN destinations d ON t.destination_id = d.id 
WHERE d.id IS NULL;

-- Mesma coisa para activities
SELECT 'Activities com destination_id inválido:' as info;
SELECT a.id, a.title, a.destination_id 
FROM activities a 
LEFT JOIN destinations d ON a.destination_id = d.id 
WHERE d.id IS NULL;

UPDATE activities 
SET destination_id = 1 
WHERE destination_id NOT IN (SELECT id FROM destinations);

-- Verificar se ainda há órfãos em activities
SELECT 'Activities órfãos após correção:' as info;
SELECT COUNT(*) as count
FROM activities a 
LEFT JOIN destinations d ON a.destination_id = d.id 
WHERE d.id IS NULL;
