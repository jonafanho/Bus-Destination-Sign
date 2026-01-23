package org.mtr.bus.controller;

import lombok.extern.slf4j.Slf4j;
import org.mtr.bus.service.FileService;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Paths;

@Slf4j
@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api")
public final class FileController {

	private final FileService fileService;

	public FileController(FileService fileService) {
		this.fileService = fileService;
	}

	@GetMapping("/writeToDirectory/{path}")
	public boolean writeToDirectory(@PathVariable String path) throws IOException {
		return fileService.writeToDirectory(Paths.get(path));
	}
}
