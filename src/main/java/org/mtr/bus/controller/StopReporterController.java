package org.mtr.bus.controller;

import it.unimi.dsi.fastutil.objects.ObjectArrayList;
import lombok.extern.slf4j.Slf4j;
import org.mtr.bus.dto.StopReporterDTO;
import org.mtr.bus.service.StopReporterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api")
public final class StopReporterController {

	private final StopReporterService stopReporterService;

	public StopReporterController(StopReporterService stopReporterService) {
		this.stopReporterService = stopReporterService;
	}

	@GetMapping("/fetchStopReporterDisplays")
	public Mono<ObjectArrayList<StopReporterDTO>> fetchStopReporterDisplays() {
		return stopReporterService.fetchDisplays();
	}

	@GetMapping("/getStopReporterDisplays")
	public ObjectArrayList<StopReporterDTO> getStopReporterDisplays() {
		return stopReporterService.getDisplays();
	}

	@GetMapping("/getGoogleDriveImage/{id}")
	public Mono<ResponseEntity<byte[]>> getGoogleDriveImage(@PathVariable String id) {
		return stopReporterService.getGoogleDriveImage(id);
	}
}
