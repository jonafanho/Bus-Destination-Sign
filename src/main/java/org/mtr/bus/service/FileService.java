package org.mtr.bus.service;

import it.unimi.dsi.fastutil.bytes.ByteArrayList;
import it.unimi.dsi.fastutil.objects.ObjectArrayList;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.mtr.bus.dto.DisplayDTO;
import org.mtr.bus.dto.DisplayImageDTO;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;

@Slf4j
@Service
public final class FileService {

	private final DisplayService displayService;

	public FileService(DisplayService displayService) {
		this.displayService = displayService;
	}

	public boolean writeToDirectory(Path path) throws IOException {
		if (Files.notExists(path)) {
			return false;
		}

		final DisplayDTO[] displays = displayService.getDisplays();

		for (int i = 0; i < displays.length; i++) {
			final Path displayDirectory = path.resolve("display_" + i);
			FileUtils.deleteQuietly(displayDirectory.toFile());
			Files.createDirectories(displayDirectory);

			final ObjectArrayList<DisplayImageDTO> displayImages = displays[i].displayImages();
			final ObjectArrayList<ByteArrayList> bytesList = new ObjectArrayList<>();

			displayImages.forEach(displayImage -> {
				if (bytesList.isEmpty() || displayImage.startOfNewGroup()) {
					final ByteArrayList bytes = ByteArrayList.of((byte) 2, (byte) 0); // Command function and display count in group
					bytesList.add(bytes);
				}

				final ByteArrayList bytes = bytesList.getLast();
				bytes.set(1, (byte) (bytes.getByte(1) + 1));
				addBytes(bytes, displayImage.displayDuration());
				addBytes(bytes, displayImage.wipeSpeed());
				addBytes(bytes, displayImage.width());
				addBytes(bytes, displayImage.scrollLeftAnchor());
				addBytes(bytes, displayImage.scrollRightAnchor());
				addBytes(bytes, displayImage.editedImageBytes().length);
				for (final byte imageByte : displayImage.editedImageBytes()) {
					bytes.add((byte) (imageByte & 0xFF));
				}
			});

			for (int j = 0; j < bytesList.size(); j++) {
				Files.write(displayDirectory.resolve("group_" + j), bytesList.get(j).toArray(new byte[0]), StandardOpenOption.WRITE, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
			}
		}

		return true;
	}

	private static void addBytes(ByteArrayList bytes, int value) {
		bytes.add((byte) ((value >> 8) & 0xFF));
		bytes.add((byte) (value & 0xFF));
	}
}
