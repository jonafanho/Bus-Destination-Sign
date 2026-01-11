#include "settings.h"
#include "display.h"
#include <SdFat.h>
#include <U8g2lib.h>
#include <ArduinoJson.h>

#define INPUT_PIN D8
#define SD_PIN D4
#define INPUT_DEBOUCE_MILLIS 200

SdFat sd;
Settings settings(sd);
Display front(U8X8_SSD1322_NHD_256X64_4W_HW_SPI(D0, D3), settings, sd, 256, 64, 0);
Display side(U8X8_SSD1322_NHD_256X64_4W_HW_SPI(D1, D3), settings, sd, 256, 64, 1);
Display back(U8X8_SH1106_128X64_VCOMH0_4W_HW_SPI(D2, D3), settings, sd, 128, 64, 2);
unsigned long debounceMillis = 0;

void setup()
{
	Serial.begin(9600);
	Serial.setTimeout(5000);
	Serial.println();

	if (sd.begin(SD_PIN, SPI_HALF_SPEED))
	{
		Serial.println("SD card mounted successfully");
	}
	else
	{
		Serial.println("Failed to mount SD card");
		while (true)
		{
			delay(1000);
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

	if (digitalRead(INPUT_PIN))
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
