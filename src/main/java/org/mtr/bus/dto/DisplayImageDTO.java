package org.mtr.bus.dto;


import java.util.UUID;

public record DisplayImageDTO(
		UUID rawImageId,
		int editTopLeftPixelX,
		int editTopLeftPixelY,
		int editTopLeftOffsetPixelX,
		int editTopLeftOffsetPixelY,
		int editBottomRightPixelX,
		int editBottomRightPixelY,
		int editContrast,
		int editScale,
		byte[] editedImageBytes,
		int displayDuration,
		int wipeSpeed,
		int width,
		int scrollLeftAnchor,
		int scrollRightAnchor
) {
}
