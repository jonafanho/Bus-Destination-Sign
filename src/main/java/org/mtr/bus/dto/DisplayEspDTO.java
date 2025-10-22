package org.mtr.bus.dto;

import it.unimi.dsi.fastutil.objects.ObjectArrayList;
import org.springframework.aot.hint.annotation.RegisterReflection;

@RegisterReflection
public record DisplayEspDTO(DisplayType displayType, ObjectArrayList<DisplayImageEspDTO> displayImages) {
}
