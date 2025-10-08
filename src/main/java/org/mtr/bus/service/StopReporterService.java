package org.mtr.bus.service;

import it.unimi.dsi.fastutil.objects.ObjectArrayList;
import it.unimi.dsi.fastutil.objects.ObjectImmutableList;
import jakarta.annotation.Nullable;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.mtr.bus.dto.StopReporterDTO;
import org.mtr.bus.entity.StopReporter;
import org.mtr.bus.repository.StopReporterRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
public final class StopReporterService {

	private final WebClient webClient;
	private final StopReporterRepository stopReporterRepository;
	private final ConcurrentHashMap<String, byte[]> imageCache = new ConcurrentHashMap<>();

	private static final String URL = "https://sites.google.com/view/stopreporter2003/電牌";
	private static final String MATCHING_CLASS_NAME = "XqQF9c";
	private static final ObjectImmutableList<String> BLACKLISTED_URLS = ObjectImmutableList.of("https://hkowsworkshop.wixsite.com/hkows", "https://sites.google.com/view/stopreporter2003/電牌/電牌更新日誌");
	private static final ObjectImmutableList<Pattern> GOOGLE_DRIVE_URL_PATTERNS = ObjectImmutableList.of(
			Pattern.compile("^https://drive\\.google\\.com/file/d/([a-zA-Z0-9_-]+)/view"),
			Pattern.compile("id=([a-zA-Z0-9_-]+)")
	);

	public StopReporterService(WebClient webClient, StopReporterRepository stopReporterRepository) {
		this.webClient = webClient;
		this.stopReporterRepository = stopReporterRepository;
	}

	/**
	 * Fetch StopReporter displays from the website. The database will be cleared and populated with the new images.
	 *
	 * @return a list of {@link StopReporterDTO} objects
	 */
	public Mono<ObjectArrayList<StopReporterDTO>> fetchDisplays() {
		log.info("Fetching StopReporter displays");
		return Mono.fromRunnable(stopReporterRepository::deleteAll).subscribeOn(Schedulers.boundedElastic()).then(parseWebsite(URL, document1 -> parseLinks(document1, getBaseUrl(URL), (document2, baseUrl1) -> {
			final ObjectArrayList<StopReporterDTO> stopReporterDTOList1 = parseDocument(document2, document2.title());

			if (stopReporterDTOList1.isEmpty()) {
				return parseLinks(document2, baseUrl1, (document3, baseUrl2) -> {
					final ObjectArrayList<StopReporterDTO> stopReporterDTOList2 = parseDocument(document3, document2.title());

					if (stopReporterDTOList2.isEmpty()) {
						log.warn("No images found for [{} {}]", document2.title(), document3.title());
					}

					return saveToDatabase(stopReporterDTOList2);
				});
			} else {
				return saveToDatabase(stopReporterDTOList1);
			}
		}))).doOnSuccess(stopReporterDTOList -> log.info("StopReporter displays fetched"));
	}

	/**
	 * Fetch StopReporter displays from the database.
	 *
	 * @return a list of {@link StopReporterDTO} objects
	 */
	public ObjectArrayList<StopReporterDTO> getDisplays() {
		return stopReporterRepository.findAll().stream().map(stopReporter -> new StopReporterDTO(stopReporter.getCategory(), stopReporter.getGroups(), stopReporter.getSources())).collect(Collectors.toCollection(ObjectArrayList::new));
	}

	public Mono<ResponseEntity<byte[]>> getGoogleDriveImage(String id) {
		final byte[] cachedBytes = imageCache.get(id);
		if (cachedBytes == null) {
			return webClient.get().uri("https://drive.usercontent.google.com/download?id=" + id).retrieve().bodyToMono(byte[].class).map(bytes -> {
				imageCache.put(id, bytes);
				return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, "image/jpeg").body(bytes);
			}).onErrorResume(e -> {
				log.error("Failed to load Google Drive image [{}]", id, e);
				return Mono.just(ResponseEntity.notFound().build());
			});
		} else {
			return Mono.just(ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, "image/jpeg").body(cachedBytes));
		}
	}

	/**
	 * Parse the document containing the table with images.
	 */
	private ObjectArrayList<StopReporterDTO> parseDocument(Document document, String category) {
		final ObjectArrayList<StopReporterDTO> stopReporterDTOList = new ObjectArrayList<>();

		// Find the div elements containing the table (inside data-code)
		document.select("div[data-code*='table']").forEach(divElement -> Jsoup.parse(divElement.attr("data-code")).select("tbody").forEach(tableElement -> {
			final Elements rowElements = tableElement.children();
			final String[] previousGroups = {"", ""};

			// Iterate each row
			rowElements.forEach(rowElement -> {
				final Elements columnElements = rowElement.children();
				final ObjectArrayList<String> groups = new ObjectArrayList<>();
				final ObjectArrayList<String> sources = new ObjectArrayList<>();

				// Iterate each column of each row
				for (int i = 0; i < columnElements.size(); i++) {
					final Element columnElement = columnElements.get(i);
					final Elements linkElements = columnElement.select("a[href]");

					if (linkElements.isEmpty()) {
						// If the column has no links, add to the groups
						final String group = columnElement.text();
						if (i < previousGroups.length) {
							if (!group.isEmpty()) {
								previousGroups[i] = group;
							}
							if (!previousGroups[i].isEmpty()) {
								groups.add(previousGroups[i]);
							}
						} else {
							if (!group.isEmpty()) {
								groups.add(group);
							}
						}
					} else {
						// If the column has links, add to the sources
						linkElements.forEach(linkElement -> {
							final String href = linkElement.attr("href");
							final String source = getGoogleDriveSource(href);
							if (source == null) {
								log.warn("Unknown image source [{}] for {}", href, groups);
							} else {
								sources.add(source);
							}
						});
					}
				}

				// Create StopReporterDTO object
				if (!groups.isEmpty() || !sources.isEmpty()) {
					stopReporterDTOList.add(new StopReporterDTO(category, groups, sources));
				}
			});
		}));

		return stopReporterDTOList;
	}

	private Mono<ObjectArrayList<StopReporterDTO>> parseLinks(Document document, String baseUrl, BiFunction<Document, String, Mono<ObjectArrayList<StopReporterDTO>>> callback) {
		final Elements elements = document.select(String.format("a.%s[href]", MATCHING_CLASS_NAME));
		final ObjectArrayList<String> links = new ObjectArrayList<>();

		// Collect all elements with href attribute and groupName by class
		elements.forEach(element -> {
			final String href = element.attr("href");
			final String newUrl = href.startsWith("/") ? baseUrl + href : href;
			if (!BLACKLISTED_URLS.contains(newUrl) && !links.contains(newUrl)) {
				links.add(newUrl);
			}
		});

		return Flux.fromIterable(links).flatMap(url -> parseWebsite(url, innerDocument -> callback.apply(innerDocument, getBaseUrl(url)))).reduce(new ObjectArrayList<>(), (initialList, newList) -> {
			initialList.addAll(newList);
			return initialList;
		});
	}

	private Mono<ObjectArrayList<StopReporterDTO>> parseWebsite(String url, Function<Document, Mono<ObjectArrayList<StopReporterDTO>>> callback) {
		return webClient.get().uri(url).retrieve().bodyToMono(String.class).retry(5).onErrorResume(e -> {
			log.error("Failed to parse website", e);
			return Mono.empty();
		}).flatMap(html -> {
			final Document document = Jsoup.parse(html);
			return callback.apply(document);
		});
	}

	private Mono<ObjectArrayList<StopReporterDTO>> saveToDatabase(ObjectArrayList<StopReporterDTO> stopReporterDTOList) {
		return Mono.fromCallable(() -> {
			stopReporterRepository.saveAll(stopReporterDTOList.stream().map(stopReporterDTO -> {
				final StopReporter stopReporter = new StopReporter();
				stopReporter.setCategory(stopReporterDTO.category());
				stopReporter.setGroups(stopReporterDTO.groups());
				stopReporter.setSources(stopReporterDTO.sources());
				return stopReporter;
			}).toList());
			return stopReporterDTOList;
		}).subscribeOn(Schedulers.boundedElastic());
	}

	/**
	 * Returns the base URL from a URL.
	 */
	private static String getBaseUrl(String url) {
		try {
			final URI uri = new URI(url);
			return String.format("%s://%s%s", uri.getScheme(), uri.getHost(), uri.getPort() > 0 ? ":" + uri.getPort() : "");
		} catch (URISyntaxException ignored) {
			return "";
		}
	}

	/**
	 * Returns the Google Drive file ID from a URL.
	 *
	 * @param url the Google Drive URL
	 * @return the file ID
	 */
	@Nullable
	private static String getGoogleDriveSource(String url) {
		for (final Pattern pattern : GOOGLE_DRIVE_URL_PATTERNS) {
			final Matcher matcher = pattern.matcher(url);
			if (matcher.find()) {
				return matcher.group(1);
			}
		}

		return null;
	}
}
