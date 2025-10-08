package org.mtr.bus.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import it.unimi.dsi.fastutil.objects.ObjectArrayList;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.mtr.bus.tool.Utilities;

import java.util.UUID;

@Slf4j
@Entity
public final class StopReporter {

	@Id
	@GeneratedValue
	private UUID uuid;

	@Getter
	@Setter
	@Column(nullable = false)
	private String category;

	@Lob
	private String groups;

	@Lob
	private String sources;

	public ObjectArrayList<String> getGroups() {
		try {
			return Utilities.OBJECT_MAPPER.readValue(groups, new TypeReference<>() {
			});
		} catch (JsonProcessingException e) {
			log.error("", e);
			return new ObjectArrayList<>();
		}
	}

	public ObjectArrayList<String> getSources() {
		try {
			return Utilities.OBJECT_MAPPER.readValue(sources, new TypeReference<>() {
			});
		} catch (JsonProcessingException e) {
			log.error("", e);
			return new ObjectArrayList<>();
		}
	}

	public void setGroups(ObjectArrayList<String> groups) {
		try {
			this.groups = Utilities.OBJECT_MAPPER.writeValueAsString(groups);
		} catch (JsonProcessingException e) {
			log.error("", e);
		}
	}

	public void setSources(ObjectArrayList<String> sources) {
		try {
			this.sources = Utilities.OBJECT_MAPPER.writeValueAsString(sources);
		} catch (JsonProcessingException e) {
			log.error("", e);
		}
	}
}
