#include "Core.h"
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <FS.h>

Core<U8X8_SSD1322_NHD_256X64_4W_HW_SPI> front(256, 64, D3, D4);
Core<U8X8_SSD1322_NHD_256X64_4W_HW_SPI> side(256, 64, D1, D4);
Core<U8X8_SH1106_128X64_VCOMH0_4W_HW_SPI> back(128, 64, D0, D4);
ESP8266WebServer server(80);

String getContentType(String filename) {
	if (filename.endsWith(".html")) return "text/html";
	else if (filename.endsWith(".css")) return "text/css";
	else if (filename.endsWith(".js")) return "application/javascript";
	else if (filename.endsWith(".ico")) return "image/x-icon";
	else return "text/plain";
}

uint8_t char2int(char input) {
	if (input >= '0' && input <= '9')
		return input - '0';
	if (input >= 'A' && input <= 'F')
		return input - 'A' + 10;
	if (input >= 'a' && input <= 'f')
		return input - 'a' + 10;
	return 0;
}

void setup() {
	front.display.begin();
	side.display.begin();
	back.display.begin();

	SPIFFS.begin();

	// wifi
	File wifiFile = SPIFFS.open("/wifi.txt", "r");
	if (wifiFile) {
		char ssid[64], password[64];
		wifiFile.readStringUntil('=');
		ssid[wifiFile.readBytesUntil('\r', ssid, sizeof(ssid) - 1)] = 0;
		wifiFile.readStringUntil('=');
		password[wifiFile.readBytesUntil('\r', password, sizeof(password) - 1)] = 0;
		wifiFile.close();

		WiFi.begin(ssid, password);
		for (uint8_t i = 0; i < 20; i++) {
			if (WiFi.status() != WL_CONNECTED) {
				delay(500);
				front.display.setFont(u8x8_font_5x7_f);
				char connecting[128];
				sprintf(connecting, "Connecting to %s...", ssid);
				front.display.drawString(0, 0, connecting);
			} else {
				server.onNotFound([]() {
					String path = server.uri();
					if (!SPIFFS.exists(path)) {
						path = "/index.html";
					}
					File file = SPIFFS.open(path, "r");
					server.streamFile(file, getContentType(path));
					file.close();
				});
				server.on("/test", HTTP_POST, []() {
					const uint8_t display = server.arg("display").toInt();
					const char *image = server.arg("plain").c_str();
					for (uint16_t i = 0; i < 2048; i++) {
						const uint8_t value = char2int(*(image + i * 2)) + (char2int(*(image + i * 2 + 1)) << 4);
						switch (display) {
							default:
								front.setImage(i, value);
								break;
							case 1:
								side.setImage(i, value);
								break;
							case 2:
								back.setImage(i, value);
								break;
						}
					}
					switch (display) {
						default:
							front.draw();
							break;
						case 1:
							side.draw();
							break;
						case 2:
							back.draw();
							break;
					}
					server.send(200, "text/html", "{\"success\":\"/test\"}");
				});
				server.begin();

				char connected[128];
				sprintf(connected, "http://%s", WiFi.localIP().toString().c_str());
				front.display.clear();
				front.display.drawString(0, 0, connected);
				break;
			}
		}
	}
}

void loop() {
	server.handleClient();
}