package org.mtr.bus.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.util.UUID;

@Slf4j
@Entity
public final class RawImage {

	@Getter
	@Id
	private final UUID uuid;

	@Getter
	@Column(nullable = false)
	private final String fileName;

	@Getter
	@Lob
	@Column(nullable = false)
	private final byte[] imageBytes;

	public RawImage() {
		uuid = UUID.randomUUID();
		fileName = "";
		imageBytes = new byte[0];
	}

	public RawImage(UUID uuid) {
		this.uuid = uuid;
		fileName = "";
		imageBytes = new byte[0];
	}

	public RawImage(String fileName, byte[] imageBytes) {
		uuid = UUID.randomUUID();
		this.fileName = fileName;
		this.imageBytes = imageBytes;
	}
}
