package org.mtr.bus.tool;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

import java.net.ServerSocket;

@Slf4j
public final class Utilities {

	public static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
	private static final int MIN_PORT = 1025;
	private static final int MAX_PORT = 65535;

	/**
	 * Find a free port (for hosting a server). Any previously used ports will be invalid.
	 *
	 * @param startingPort the port to start the search from
	 * @return a free port
	 */
	public static int findFreePort(int startingPort) {
		for (int i = Math.max(MIN_PORT, startingPort); i <= MAX_PORT; i++) {
			try (final ServerSocket serverSocket = new ServerSocket(i)) {
				final int port = serverSocket.getLocalPort();
				log.info("Found available port: {}", port);
				return port;
			} catch (Exception ignored) {
			}
		}
		return 0;
	}
}
