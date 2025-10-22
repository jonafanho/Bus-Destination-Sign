package org.mtr.bus.dto;

import org.springframework.aot.hint.annotation.RegisterReflection;

@RegisterReflection
public record DisplayImageEspDTO(int displayDuration, int wipeSpeed, int width, int scrollLeftAnchor, int scrollRightAnchor) {
}
