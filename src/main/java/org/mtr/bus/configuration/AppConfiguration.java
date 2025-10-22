package org.mtr.bus.configuration;

import jakarta.annotation.Nullable;
import lombok.extern.slf4j.Slf4j;
import org.mtr.bus.Application;
import org.mtr.bus.dto.*;
import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportRuntimeHints;
import org.springframework.context.event.EventListener;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Configuration
@ImportRuntimeHints(AppConfiguration.Hints.class)
public class AppConfiguration {

	private static final int BUFFER_SIZE = 16 * 1024 * 1024; // 16 MB

	@Bean
	public WebClient webClient() {
		return WebClient.builder().codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(BUFFER_SIZE)).build();
	}

	@EventListener(ApplicationReadyEvent.class)
	public void applicationReady() {
		log.info("Angular application ready [http://localhost:{}]", Application.SERVER_PORT);
	}

	static class Hints implements RuntimeHintsRegistrar {

		@Override
		public void registerHints(RuntimeHints runtimeHints, @Nullable ClassLoader classLoader) {
			runtimeHints.reflection()
					.registerType(DisplayDTO[].class, builder -> builder.withMembers(MemberCategory.UNSAFE_ALLOCATED))
					.registerType(DisplayEspDTO[].class, builder -> builder.withMembers(MemberCategory.UNSAFE_ALLOCATED))
					.registerType(DisplayImageDTO[].class, builder -> builder.withMembers(MemberCategory.UNSAFE_ALLOCATED))
					.registerType(DisplayImageEspDTO[].class, builder -> builder.withMembers(MemberCategory.UNSAFE_ALLOCATED))
					.registerType(StopReporterDTO[].class, builder -> builder.withMembers(MemberCategory.UNSAFE_ALLOCATED));
		}
	}
}
