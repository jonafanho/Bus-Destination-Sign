#include "Core.h"
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <FS.h>

Core<U8X8_SSD1322_NHD_256X64_4W_HW_SPI> front(256, 64, D3, D4);
Core<U8X8_SSD1322_NHD_256X64_4W_HW_SPI> side(256, 64, D1, D4);
Core<U8X8_SH1106_128X64_VCOMH0_4W_HW_SPI> back(128, 64, D0, D4);

sdfat::SdFat sd;
sdfat::File frontFolder, sideFolder, backFolder;

uint8_t currentFolder = 0, switchDelay = 2, scrollMode = 1;
uint32_t ticks = 0;

const uint8_t MAX_FOLDERS = 10, SETTINGS_COUNT = 6, SETTINGS_MAIN_COUNT = 2, SETTINGS_WIFI_COUNT = 2;
const String SETTINGS[] = {
		"front_scale=",
		"front_crop=",
		"side_scale=",
		"side_crop=",
		"back_scale=",
		"back_crop=",
};
const String SETTINGS_MAIN[] = {
		"scroll_animation=",
		"switch_delay=",
};
const String SETTINGS_WIFI[] = {
		"ssid=",
		"password=",
};
const uint8_t DEFAULT_SETTINGS[] = {3, 20, 3, 19, 1, 0};
const uint8_t DEFAULT_SETTINGS_MAIN[] = {1, 2};
const String DEFAULT_SETTINGS_WIFI[] = {"", ""};

ESP8266WebServer server(80);

template<class T>
void writeDefaultSettings(const char *name, const String *settings, const T *defaultSettings, const uint8_t settingsCount) {
	sdfat::File settingsFile;
	settingsFile.open(name, sdfat::O_WRONLY | sdfat::O_CREAT | sdfat::O_TRUNC);
	for (uint8_t i = 0; i < settingsCount; i++)
		settingsFile.println(settings[i] + String(defaultSettings[i]));
	settingsFile.flush();
	settingsFile.close();
}

template<class T>
T convertString(String string) {
	return string.toInt();
}

template<>
String convertString<String>(String string) {
	return string;
}

template<class T>
void readSettings(const char *name, T *settingsOut, const String *settings, const T *defaultSettings, const uint8_t settingsCount) {
	sdfat::File settingsFile;
	boolean validFile = true;
	if (settingsFile.open(name, sdfat::O_RDONLY)) {
		char buffer[128];
		settingsFile.read(buffer, 128);
		String text(buffer);

		for (uint8_t i = 0; i < settingsCount; i++) {
			settingsOut[i] = defaultSettings[i];

			int8_t settingIndex = text.indexOf(settings[i]);
			if (settingIndex < 0) {
				validFile = false;
				break;
			}

			text = text.substring(settingIndex + settings[i].length());

			int8_t crlfIndex = text.indexOf("\r\n");
			if (crlfIndex < 0) {
				validFile = false;
				break;
			}

			settingsOut[i] = convertString<T>(text.substring(0, crlfIndex));
		}

		settingsFile.close();
	} else {
		validFile = false;
	}

	if (!validFile)
		writeDefaultSettings<T>(name, settings, defaultSettings, settingsCount);
}

void openAndIncrementFolder() {
	char name[32];
	boolean frontEmpty = true, sideEmpty = true, backEmpty = true;
	while (frontEmpty && sideEmpty && backEmpty) {
		sprintf(name, "%d/front", currentFolder);
		frontEmpty = front.setFolder(name);

		sprintf(name, "%d/side", currentFolder);
		sideEmpty = side.setFolder(name);

		sprintf(name, "%d/back", currentFolder);
		backEmpty = back.setFolder(name);

		sprintf(name, "%d/image_settings.txt", currentFolder);

		currentFolder++;
		if (currentFolder == MAX_FOLDERS)
			currentFolder = 0;
	}

	uint8_t settingValues[SETTINGS_COUNT];
	readSettings<uint8_t>(name, settingValues, SETTINGS, DEFAULT_SETTINGS, SETTINGS_COUNT);

	front.setScaleCrop(settingValues[0], settingValues[1]);
	side.setScaleCrop(settingValues[2], settingValues[3]);
	back.setScaleCrop(settingValues[4], settingValues[5]);
}

String getContentType(String
					  filename) {
	if (filename.endsWith(".html")) return "text/html";
	else if (filename.endsWith(".css")) return "text/css";
	else if (filename.endsWith(".js")) return "application/javascript";
	else if (filename.endsWith(".ico")) return "image/x-icon";
	else return "text/plain";
}

void setup() {
	front.display.begin();
	side.display.begin();
	back.display.begin();

	// sd card
	if (!sd.begin(D2, SPI_HALF_SPEED)) {
		front.display.setFont(u8x8_font_5x7_f);
		front.display.drawString(0, 0, "SD card initialization failed.");
		while (true) {
		}
	}

	SPIFFS.begin();

	// wifi
	String settingValuesWifi[SETTINGS_WIFI_COUNT];
	readSettings<String>("wifi.txt", settingValuesWifi, SETTINGS_WIFI, DEFAULT_SETTINGS_WIFI, SETTINGS_WIFI_COUNT);
	WiFi.begin(settingValuesWifi[0], settingValuesWifi[1]);
	for (uint8_t i = 0; i < 20; i++) {
		if (WiFi.status() != WL_CONNECTED) {
			delay(500);
			front.display.setFont(u8x8_font_5x7_f);
			char connecting[128];
			sprintf(connecting, "Connecting to %s...", settingValuesWifi[0].c_str());
			front.display.drawString(0, 0, connecting);
		} else {
			server.onNotFound([]() {
				String path = server.uri();
				if (!SPIFFS.exists(path)) {
					path = "/index.html";
				}
				File file = SPIFFS.open(path, "r");
				size_t sent = server.streamFile(file, getContentType(path));
				file.close();
			});
			server.begin();
			char connected[128];
			sprintf(connected, "http://%s", WiFi.localIP().toString().c_str());
			front.display.clear();
			front.display.drawString(0, 0, connected);
			break;
		}
	}

	// default folders and settings files
	for (uint8_t i = 0; i < MAX_FOLDERS; i++) {
		char name[32];

		sprintf(name, "%d/front", i);
		sd.mkdir(name);
		sprintf(name, "%d/side", i);
		sd.mkdir(name);
		sprintf(name, "%d/back", i);
		sd.mkdir(name);

		sprintf(name, "%d/image_settings.txt", i);
		sdfat::File settingsFile;
		if (settingsFile.open(name, sdfat::O_RDONLY))
			settingsFile.close();
		else
			writeDefaultSettings<uint8_t>(name, SETTINGS, DEFAULT_SETTINGS, SETTINGS_COUNT);
	}

	uint8_t settingValues[SETTINGS_MAIN_COUNT];
	readSettings<uint8_t>("global_settings.txt", settingValues, SETTINGS_MAIN, DEFAULT_SETTINGS_MAIN, SETTINGS_MAIN_COUNT);
	scrollMode = settingValues[0];
	switchDelay = settingValues[1];

	openAndIncrementFolder();
}

void loop() {
	for (uint8_t j = 0; j < 3; j++) {
		server.handleClient();
		front.loadBmp();
		side.loadBmp();
		back.loadBmp();

		while (ticks != 0 && (millis() - ticks) / 1000 < (uint32_t) switchDelay) {
		}
		ticks = millis();

		switch (scrollMode) {
			case 0:
				front.draw();
				back.draw();
				side.draw();
				break;
			case 1:
				for (uint16_t i = 0; i < 256; i++) {
					front.step(i);
					side.step(i);
					back.step(i);
					delay(2);
				}
				break;
		}
	}

	openAndIncrementFolder();
}