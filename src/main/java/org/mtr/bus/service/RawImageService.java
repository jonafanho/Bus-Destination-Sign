package org.mtr.bus.service;

import lombok.extern.slf4j.Slf4j;
import org.mtr.bus.entity.RawImage;
import org.mtr.bus.repository.RawImageRepository;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public final class RawImageService {

	private final RawImageRepository rawImageRepository;

	public RawImageService(RawImageRepository rawImageRepository) {
		this.rawImageRepository = rawImageRepository;
	}

	public Mono<Void> saveRawImages(Flux<FilePart> fileParts) {
		return fileParts.flatMap(filePart -> DataBufferUtils.join(filePart.content()).flatMap(dataBuffer -> {
			final byte[] bytes = new byte[dataBuffer.readableByteCount()];
			dataBuffer.read(bytes);
			DataBufferUtils.release(dataBuffer);
			return saveRawImage(filePart.filename(), bytes);
		})).then();
	}

	public Mono<Void> saveRawImage(String fileName, byte[] bytes) {
		return Mono.fromRunnable(() -> rawImageRepository.save(new RawImage(fileName, bytes))).subscribeOn(Schedulers.boundedElastic()).then();
	}

	public ResponseEntity<byte[]> getRawImage(UUID uuid) {
		return rawImageRepository.findById(uuid).map(rawImage -> ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_JPEG_VALUE).body(rawImage.getImageBytes())
		).orElse(ResponseEntity.notFound().build());
	}

	public List<UUID> getRawImageIds() {
		return rawImageRepository.findAllSortedIds();
	}

	public void deleteRawImage(UUID uuid) {
		rawImageRepository.deleteById(uuid);
	}
}
