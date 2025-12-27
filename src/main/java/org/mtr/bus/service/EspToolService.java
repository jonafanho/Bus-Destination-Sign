package org.mtr.bus.service;

import com.fazecast.jSerialComm.SerialPort;
import it.unimi.dsi.fastutil.objects.ObjectArrayList;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.mtr.bus.dto.DisplayDTO;
import org.mtr.bus.dto.DisplayEspDTO;
import org.mtr.bus.dto.DisplayImageDTO;
import org.mtr.bus.dto.DisplayImageEspDTO;
import org.mtr.bus.tool.Utilities;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@Slf4j
@Service
public final class EspToolService {

	private final DisplayService displayService;

	public EspToolService(DisplayService displayService) {
		this.displayService = displayService;
	}

	public boolean writeToEsp(String port, boolean writeImages) throws IOException {
		final SerialPort espPort = detectEspPorts(false).stream().filter(serialPort -> serializeSerialPort(serialPort).equals(port)).findFirst().orElse(null);
		if (espPort == null) {
			log.error("No ESP8266 device detected on port [{}]", port);
			return false;
		}

		espPort.setComPortTimeouts(SerialPort.TIMEOUT_READ_SEMI_BLOCKING, 8000, 0);
		espPort.setBaudRate(9600);
		if (espPort.openPort()) {
			log.info("Connected to port [{}]", port);
		} else {
			log.error("Failed to open port [{}]", port);
			return false;
		}

		try (
				final OutputStream outputStream = espPort.getOutputStream();
				final InputStream inputStream = espPort.getInputStream();
				final InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
				final BufferedReader bufferedReader = new BufferedReader(inputStreamReader)
		) {
			while (espPort.bytesAvailable() > 0) {
				log.info("Flushing existing data: [{}]", IOUtils.toString(inputStream, StandardCharsets.UTF_8));
			}

			if (writeImages) {
				writeFile(outputStream, bufferedReader, "clear", "clear".getBytes());
			}

			final DisplayDTO[] displays = displayService.getDisplays();
			writeFile(outputStream, bufferedReader, "settings.json", Utilities.OBJECT_MAPPER.writeValueAsString(getDisplaysForEsp(displays)).getBytes());

			if (writeImages) {
				for (int i = 0; i < displays.length; i++) {
					final ObjectArrayList<DisplayImageDTO> displayImages = displays[i].displayImages();
					for (int j = 0; j < displayImages.size(); j++) {
						writeFile(outputStream, bufferedReader, String.format("displays/%s_%s", i, j), displayImages.get(j).editedImageBytes());
					}
				}
			}
		}

		espPort.closePort();
		log.info("File write completed");
		return true;
	}

	public ObjectArrayList<String> detectEspPortNames() {
		return detectEspPorts(true).stream().map(EspToolService::serializeSerialPort).collect(Collectors.toCollection(ObjectArrayList::new));
	}

	private static DisplayEspDTO[] getDisplaysForEsp(DisplayDTO[] displays) {
		final DisplayEspDTO[] displaysForEsp = new DisplayEspDTO[displays.length];

		for (int i = 0; i < displays.length; i++) {
			displaysForEsp[i] = new DisplayEspDTO(
					displays[i].displayType(),
					displays[i].displayImages().stream().map(displayImage -> new DisplayImageEspDTO(
							displayImage.displayDuration(),
							displayImage.wipeSpeed(),
							displayImage.width(),
							displayImage.scrollLeftAnchor(),
							displayImage.scrollRightAnchor()
					)).collect(Collectors.toCollection(ObjectArrayList::new))
			);
		}

		return displaysForEsp;
	}

	private static void writeFile(OutputStream outputStream, BufferedReader bufferedReader, String fileName, byte[] data) throws IOException {
		outputStream.write((fileName + "\n").getBytes());
		outputStream.write((data.length + "\n").getBytes());
		outputStream.write(data);
		outputStream.flush();

		final String response = bufferedReader.readLine();
		if (("OK:" + fileName).equals(response)) {
			log.info("File [{}] written to ESP8266", fileName);
		} else {
			log.error("Failed to write file [{}] to ESP8266", fileName);
		}
	}

	private static ObjectArrayList<SerialPort> detectEspPorts(boolean printLogs) {
		final SerialPort[] serialPorts = SerialPort.getCommPorts();
		final ObjectArrayList<SerialPort> espPorts = new ObjectArrayList<>();

		for (final SerialPort serialPort : serialPorts) {
			final String descriptivePortName = serialPort.getDescriptivePortName().toLowerCase();
			if (descriptivePortName.contains("cp210") || descriptivePortName.contains("ch340")) {
				espPorts.add(serialPort);
				if (printLogs) {
					log.info("Found serial port (matching): [{}]", serializeSerialPort(serialPort));
				}
			} else {
				if (printLogs) {
					log.info("Found serial port (not matching): [{}]", serializeSerialPort(serialPort));
				}
			}
		}

		if (espPorts.isEmpty() && printLogs) {
			log.error("No ESP8266 device detected");
		}

		return espPorts;
	}

	private static String serializeSerialPort(SerialPort serialPort) {
		return String.format("%s - %s", serialPort.getSystemPortName(), serialPort.getDescriptivePortName());
	}
}
