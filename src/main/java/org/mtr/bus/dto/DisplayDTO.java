package org.mtr.bus.dto;

import it.unimi.dsi.fastutil.objects.ObjectArrayList;

public record DisplayDTO(DisplayType displayType, int scale, ObjectArrayList<DisplayImageDTO> displayImages) {
}
