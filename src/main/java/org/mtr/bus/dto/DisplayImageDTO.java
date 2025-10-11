package org.mtr.bus.dto;


import java.util.UUID;

public record DisplayImageDTO(
		UUID rawImageId,
		int editPixelX,
		int editPixelY,
		int editPixelCountX,
		int editPixelCountY,
		byte[] editedImageBytes,
		int wipeDuration,
		int width,
		int scrollLeftAnchor,
		int scrollRightAnchor
) {
}
