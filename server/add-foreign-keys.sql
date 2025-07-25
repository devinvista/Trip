-- Adicionar foreign keys agora que as referências estão corretas
ALTER TABLE trips ADD CONSTRAINT trips_destinations_fk FOREIGN KEY (destination_id) REFERENCES destinations(id);
ALTER TABLE activities ADD CONSTRAINT activities_destinations_fk FOREIGN KEY (destination_id) REFERENCES destinations(id);
