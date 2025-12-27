package org.mtr.bus.repository;

import org.mtr.bus.entity.Display;
import org.mtr.bus.entity.DisplayImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DisplayImageRepository extends JpaRepository<DisplayImage, UUID> {

	void deleteAllByDisplay(Display display);
}
