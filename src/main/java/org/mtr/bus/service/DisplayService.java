package org.mtr.bus.service;

import it.unimi.dsi.fastutil.objects.ObjectArrayList;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.mtr.bus.dto.DisplayDTO;
import org.mtr.bus.dto.DisplayImageDTO;
import org.mtr.bus.entity.Display;
import org.mtr.bus.entity.DisplayImage;
import org.mtr.bus.repository.DisplayImageRepository;
import org.mtr.bus.repository.DisplayRepository;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Slf4j
@Service
public class DisplayService {

	private final DisplayRepository displayRepository;
	private final DisplayImageRepository displayImageRepository;

	private static final int DISPLAY_COUNT = 3;

	public DisplayService(DisplayRepository displayRepository, DisplayImageRepository displayImageRepository) {
		this.displayRepository = displayRepository;
		this.displayImageRepository = displayImageRepository;
	}

	public DisplayDTO[] getDisplays() {
		final DisplayDTO[] displays = new DisplayDTO[DISPLAY_COUNT];

		displayRepository.findAll().forEach(display -> {
			if (display.getIndex() >= 0 && display.getIndex() < DISPLAY_COUNT) {
				displays[display.getIndex()] = mapDisplay(display);
			} else {
				displayRepository.delete(display);
			}
		});

		for (int i = 0; i < displays.length; i++) {
			if (displays[i] == null) {
				displays[i] = mapDisplay(displayRepository.save(new Display(i)));
			}
		}

		return displays;
	}

	@Transactional
	public void saveDisplays(ObjectArrayList<DisplayDTO> displayDTOList) {
		for (int i = 0; i < DISPLAY_COUNT; i++) {
			if (i < displayDTOList.size()) {
				final Display display = mapDisplay(i, displayDTOList.get(i));
				final ObjectArrayList<DisplayImage> displayImagesCopy = new ObjectArrayList<>(display.getDisplayImages());
				displayRepository.save(display);
				displayImageRepository.deleteAllByDisplay(display);
				displayImageRepository.saveAll(displayImagesCopy);
			}
		}
	}

	private static DisplayDTO mapDisplay(Display display) {
		return new DisplayDTO(display.getDisplayType(), Math.max(1, display.getScale()), display.getDisplayImages().stream().map(displayImage -> new DisplayImageDTO(
				displayImage.getImageBytes(),
				displayImage.getWipeDuration(),
				displayImage.getWidth(),
				displayImage.getScrollLeftAnchor(),
				displayImage.getScrollRightAnchor()
		)).collect(Collectors.toCollection(ObjectArrayList::new)));
	}

	private static Display mapDisplay(int index, DisplayDTO displayDTO) {
		final Display display = new Display(index);
		display.setDisplayType(displayDTO.displayType());
		display.setScale(Math.max(1, displayDTO.scale()));

		displayDTO.displayImages().forEach(displayImageDTO -> {
			final DisplayImage displayImage = new DisplayImage(index);
			displayImage.setImageBytes(displayImageDTO.imageBytes());
			displayImage.setWipeDuration(displayImageDTO.wipeDuration());
			displayImage.setWidth(displayImageDTO.width());
			displayImage.setScrollLeftAnchor(displayImageDTO.scrollLeftAnchor());
			displayImage.setScrollRightAnchor(displayImageDTO.scrollRightAnchor());
			display.getDisplayImages().add(displayImage);
		});

		return display;
	}
}
