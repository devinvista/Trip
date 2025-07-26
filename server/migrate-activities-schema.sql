-- Remove unnecessary location fields from activities table
-- Centralizing all location data in destinations table

-- First check if columns exist and drop them
SET @sql = '';
SELECT CONCAT('ALTER TABLE activities DROP COLUMN ', column_name, ';') INTO @sql
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
  AND table_name = 'activities' 
  AND column_name IN ('country_type', 'region', 'city', 'city_id', 'location');

-- Execute the drop statements (if any columns exist)
-- Note: This is safer as it won't error if columns don't exist

-- Ensure destination_id column exists and is properly constrained
ALTER TABLE activities 
MODIFY COLUMN destination_id INT NOT NULL;

-- Add foreign key constraint if it doesn't exist
ALTER TABLE activities 
ADD CONSTRAINT IF NOT EXISTS fk_activities_destination 
FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Verify the schema is clean
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'activities'
ORDER BY ORDINAL_POSITION;