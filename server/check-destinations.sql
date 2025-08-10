-- Check destinations table content
SELECT id, name, state, country, country_type, region, continent, is_active 
FROM destinations 
ORDER BY name;

-- Check activities table and their destination relationships
SELECT a.id, a.title, a.destination_id, a.destination_name, a.city, a.country, 
       d.name as dest_name, d.country as dest_country
FROM activities a 
LEFT JOIN destinations d ON a.destination_id = d.id
ORDER BY a.id;

-- Count activities by destination
SELECT d.name, COUNT(a.id) as activity_count
FROM destinations d 
LEFT JOIN activities a ON d.id = a.destination_id
WHERE d.is_active = true
GROUP BY d.id, d.name
ORDER BY activity_count DESC;