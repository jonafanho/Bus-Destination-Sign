package org.mtr.bus;

import it.unimi.dsi.fastutil.objects.Object2ObjectOpenHashMap;
import org.mtr.bus.tool.Utilities;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Path;
import java.nio.file.Paths;

@SpringBootApplication
public class Application {

	public static final int SERVER_PORT = Utilities.findFreePort(8080);
	public static final Path APPLICATION_PATH = Paths.get(System.getProperty("user.dir"), "Bus-Destination-Sign");

	public static void main(String[] args) {
		final SpringApplication springApplication = new SpringApplication(Application.class);
		final Object2ObjectOpenHashMap<String, Object> properties = new Object2ObjectOpenHashMap<>();
		properties.put("server.port", SERVER_PORT);
		springApplication.setDefaultProperties(properties);
		springApplication.run(args);
	}
}
