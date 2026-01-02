package org.mtr.bus.dto;

import it.unimi.dsi.fastutil.objects.ObjectArrayList;

public record DisplayEspDTO(DisplayType displayType, ObjectArrayList<DisplayGroupEspDTO> displayGroups) {
}
