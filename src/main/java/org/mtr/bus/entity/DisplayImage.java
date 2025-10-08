package org.mtr.bus.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import java.util.UUID;

@Slf4j
@Entity
public final class DisplayImage {

	@Id
	@GeneratedValue
	private UUID uuid;

	@Getter
	@ManyToOne
	private Display display;

	@Getter
	@Setter
	@Column(nullable = false)
	private byte[] imageBytes;

	@Getter
	@Setter
	@Column(nullable = false)
	private int wipeDuration;

	@Getter
	@Setter
	@Column(nullable = false)
	private int width;

	@Getter
	@Setter
	@Column(nullable = false)
	private int scrollLeftAnchor;

	@Getter
	@Setter
	@Column(nullable = false)
	private int scrollRightAnchor;

	@Deprecated
	public DisplayImage() {
	}

	public DisplayImage(int index) {
		this.display = new Display(index);
	}
}
