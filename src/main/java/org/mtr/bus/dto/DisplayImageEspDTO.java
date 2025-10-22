package org.mtr.bus.dto;

import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.annotation.RegisterReflection;

@RegisterReflection(memberCategories = MemberCategory.UNSAFE_ALLOCATED)
public record DisplayImageEspDTO(int displayDuration, int wipeSpeed, int width, int scrollLeftAnchor, int scrollRightAnchor) {
}
