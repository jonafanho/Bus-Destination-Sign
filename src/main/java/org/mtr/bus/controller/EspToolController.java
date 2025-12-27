package org.mtr.bus.controller;

import it.unimi.dsi.fastutil.objects.ObjectArrayList;
import lombok.extern.slf4j.Slf4j;
import org.mtr.bus.service.EspToolService;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@Slf4j
@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api")
public final class EspToolController {

	private final EspToolService espToolService;

	public EspToolController(EspToolService espToolService) {
		this.espToolService = espToolService;
	}

	@GetMapping("/writeSettingsToEsp/{port}")
	public boolean writeSettingsToEsp(@PathVariable String port) throws IOException {
		return espToolService.writeToEsp(port, false);
	}

	@GetMapping("/writeSettingsAndImagesToEsp/{port}")
	public boolean writeSettingsAndImagesToEsp(@PathVariable String port) throws IOException {
		return espToolService.writeToEsp(port, true);
	}

	@GetMapping("/detectEspPortNames")
	public ObjectArrayList<String> detectEspPortNames() {
		return espToolService.detectEspPortNames();
	}
}
