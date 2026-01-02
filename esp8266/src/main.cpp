#include "settings.h"
#include "display.h"
#include <LittleFS.h>
#include <U8g2lib.h>
#include <ArduinoJson.h>

#define INPUT_PIN D4
#define INPUT_DEBOUCE_MILLIS 200

Settings settings;
Display front(U8X8_SSD1322_NHD_256X64_4W_HW_SPI(D0, D3), settings, 256, 64, 0);
Display side(U8X8_SSD1322_NHD_256X64_4W_HW_SPI(D1, D3), settings, 256, 64, 1);
Display back(U8X8_SH1106_128X64_VCOMH0_4W_HW_SPI(D2, D3), settings, 128, 64, 2);
unsigned long debounceMillis = 0;

void setup()
{
	Serial.begin(9600);
	Serial.setTimeout(5000);
	Serial.println();

	pinMode(INPUT_PIN, INPUT_PULLUP);

	if (LittleFS.begin())
	{
		Serial.println("LittleFS mounted successfully");
	}
	else
	{
		Serial.println("Failed to mount LittleFS");
		while (true)
		{
		}
	}

	front.begin();
	side.begin();
	back.begin();
}

void loop()
{
	settings.receiveFile();
	front.tick();
	side.tick();
	back.tick();

	if (digitalRead(INPUT_PIN) == LOW)
	{
		if (millis() > debounceMillis)
		{
			front.changeGroup();
			side.changeGroup();
			back.changeGroup();
		}
		debounceMillis = millis() + INPUT_DEBOUCE_MILLIS;
	}
}
