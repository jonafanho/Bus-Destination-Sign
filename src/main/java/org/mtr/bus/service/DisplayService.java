package org.mtr.bus.service;

import it.unimi.dsi.fastutil.objects.ObjectArrayList;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.mtr.bus.dto.DisplayDTO;
import org.mtr.bus.dto.DisplayImageDTO;
import org.mtr.bus.entity.Display;
import org.mtr.bus.entity.DisplayImage;
import org.mtr.bus.entity.RawImage;
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
		return new DisplayDTO(display.getDisplayType(), display.getDisplayImages().stream().map(displayImage -> new DisplayImageDTO(
				displayImage.getRawImage().getUuid(),
				displayImage.isStartOfNewGroup(),
				displayImage.getEditTopLeftPixelX(),
				displayImage.getEditTopLeftPixelY(),
				displayImage.getEditTopLeftOffsetPixelX(),
				displayImage.getEditTopLeftOffsetPixelY(),
				displayImage.getEditBottomRightPixelX(),
				displayImage.getEditBottomRightPixelY(),
				displayImage.getEditContrast(),
				displayImage.getEditScale(),
				displayImage.getEditedImageBytes(),
				displayImage.getDisplayDuration(),
				displayImage.getWipeSpeed(),
				displayImage.getWidth(),
				displayImage.getScrollLeftAnchor(),
				displayImage.getScrollRightAnchor()
		)).collect(Collectors.toCollection(ObjectArrayList::new)));
	}

	private static Display mapDisplay(int index, DisplayDTO displayDTO) {
		final Display display = new Display(index);
		display.setDisplayType(displayDTO.displayType());

		displayDTO.displayImages().forEach(displayImageDTO -> {
			final DisplayImage displayImage = new DisplayImage(index);
			displayImage.setRawImage(new RawImage(displayImageDTO.rawImageId()));
			displayImage.setStartOfNewGroup(displayImageDTO.startOfNewGroup());
			displayImage.setEditTopLeftPixelX(displayImageDTO.editTopLeftPixelX());
			displayImage.setEditTopLeftPixelY(displayImageDTO.editTopLeftPixelY());
			displayImage.setEditTopLeftOffsetPixelX(displayImageDTO.editTopLeftOffsetPixelX());
			displayImage.setEditTopLeftOffsetPixelY(displayImageDTO.editTopLeftOffsetPixelY());
			displayImage.setEditBottomRightPixelX(displayImageDTO.editBottomRightPixelX());
			displayImage.setEditBottomRightPixelY(displayImageDTO.editBottomRightPixelY());
			displayImage.setEditContrast(displayImageDTO.editContrast());
			displayImage.setEditScale(displayImageDTO.editScale());
			displayImage.setEditedImageBytes(displayImageDTO.editedImageBytes());
			displayImage.setDisplayDuration(displayImageDTO.displayDuration());
			displayImage.setWipeSpeed(displayImageDTO.wipeSpeed());
			displayImage.setWidth(displayImageDTO.width());
			displayImage.setScrollLeftAnchor(displayImageDTO.scrollLeftAnchor());
			displayImage.setScrollRightAnchor(displayImageDTO.scrollRightAnchor());
			display.getDisplayImages().add(displayImage);
		});

		return display;
	}
}
