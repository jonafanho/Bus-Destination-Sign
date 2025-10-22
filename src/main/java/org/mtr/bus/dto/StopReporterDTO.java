package org.mtr.bus.dto;

import it.unimi.dsi.fastutil.objects.ObjectArrayList;

public record StopReporterDTO(String category, ObjectArrayList<String> groups, ObjectArrayList<String> sources) {
}
