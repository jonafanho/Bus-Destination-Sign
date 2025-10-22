package org.mtr.bus.dto;

import it.unimi.dsi.fastutil.objects.ObjectArrayList;
import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.annotation.RegisterReflection;

@RegisterReflection(memberCategories = MemberCategory.UNSAFE_ALLOCATED)
public record DisplayEspDTO(DisplayType displayType, ObjectArrayList<DisplayImageEspDTO> displayImages) {
}
