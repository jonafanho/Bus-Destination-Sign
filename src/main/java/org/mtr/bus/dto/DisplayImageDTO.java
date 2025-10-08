package org.mtr.bus.dto;

public record DisplayImageDTO(byte[] imageBytes, int wipeDuration, int width, int scrollLeftAnchor, int scrollRightAnchor) {
}
