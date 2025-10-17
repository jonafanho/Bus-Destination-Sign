package org.mtr.bus.controller;

import lombok.extern.slf4j.Slf4j;
import org.mtr.bus.service.RawImageService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api")
public final class RawImageController {

	private final RawImageService rawImageService;

	public RawImageController(RawImageService rawImageService) {
		this.rawImageService = rawImageService;
	}

	@PostMapping("/saveRawImages")
	public Mono<Void> saveRawImages(@RequestPart("files") Flux<FilePart> fileParts) {
		return rawImageService.saveRawImages(fileParts);
	}

	@GetMapping("/getRawImage/{uuid}")
	public ResponseEntity<byte[]> getRawImage(@PathVariable UUID uuid) {
		return rawImageService.getRawImage(uuid);
	}

	@GetMapping("/getRawImageIds")
	public List<UUID> getRawImageIds() {
		return rawImageService.getRawImageIds();
	}

	@GetMapping("/deleteRawImage/{uuid}")
	public void deleteRawImage(@PathVariable UUID uuid) {
		rawImageService.deleteRawImage(uuid);
	}
}
