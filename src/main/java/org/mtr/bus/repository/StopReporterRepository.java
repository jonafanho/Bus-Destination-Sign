package org.mtr.bus.repository;

import org.mtr.bus.entity.StopReporter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StopReporterRepository extends JpaRepository<StopReporter, UUID> {
}
