package org.mtr.bus.controller;

import it.unimi.dsi.fastutil.objects.ObjectArrayList;
import lombok.extern.slf4j.Slf4j;
import org.mtr.bus.dto.DisplayDTO;
import org.mtr.bus.service.DisplayService;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api")
public final class DisplayController {

	private final DisplayService displayService;

	public DisplayController(DisplayService displayService) {
		this.displayService = displayService;
	}

	@GetMapping("/getDisplays")
	public DisplayDTO[] getDisplays() {
		return displayService.getDisplays();
	}

	@PostMapping("/saveDisplays")
	public void saveDisplays(@RequestBody ObjectArrayList<DisplayDTO> displayDTOList) {
		displayService.saveDisplays(displayDTOList);
	}
}
