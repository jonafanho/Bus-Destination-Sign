package org.mtr.bus.repository;

import org.mtr.bus.entity.RawImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface RawImageRepository extends JpaRepository<RawImage, UUID> {

	@Query("SELECT r.uuid FROM RawImage r ORDER BY r.fileName ASC")
	List<UUID> findAllSortedIds();
}
