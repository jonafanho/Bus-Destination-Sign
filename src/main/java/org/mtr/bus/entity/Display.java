package org.mtr.bus.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.mtr.bus.dto.DisplayType;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Slf4j
@Entity
public final class Display {

	@Getter
	@Id
	private final Integer index;

	@Getter
	@Setter
	@Column(nullable = false)
	private DisplayType displayType = DisplayType.NONE;

	@Getter
	@OneToMany(mappedBy = "display", fetch = FetchType.EAGER)
	private final List<DisplayImage> displayImages = new ArrayList<>();

	@Deprecated
	public Display() {
		index = new Random().nextInt();
	}

	public Display(int index) {
		this.index = index;
	}
}
