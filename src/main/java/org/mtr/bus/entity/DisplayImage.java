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
	@ManyToOne
	private RawImage rawImage;

	@Getter
	@Setter
	@Column(nullable = false)
	private boolean startOfNewGroup;

	@Getter
	@Setter
	@Column(nullable = false)
	private int editTopLeftPixelX;

	@Getter
	@Setter
	@Column(nullable = false)
	private int editTopLeftPixelY;

	@Getter
	@Setter
	@Column(nullable = false)
	private int editTopLeftOffsetPixelX;

	@Getter
	@Setter
	@Column(nullable = false)
	private int editTopLeftOffsetPixelY;

	@Getter
	@Setter
	@Column(nullable = false)
	private int editBottomRightPixelX;

	@Getter
	@Setter
	@Column(nullable = false)
	private int editBottomRightPixelY;

	@Getter
	@Setter
	@Column(nullable = false)
	private int editContrast;

	@Getter
	@Setter
	@Column(nullable = false)
	private int editScale;

	@Getter
	@Setter
	@Lob
	@Column(nullable = false)
	private byte[] editedImageBytes;

	@Getter
	@Setter
	@Column(nullable = false)
	private int displayDuration;

	@Getter
	@Setter
	@Column(nullable = false)
	private int wipeSpeed;

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
