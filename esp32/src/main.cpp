#include "ssd1322.h"

SSD1322 ssd1322;

void setup()
{
	ssd1322.init();
	ssd1322.setTargetFramesPerSecond(SSD1322_SCREEN_WIDTH);
}

uint16_t bar = 0;

void loop()
{
	unsigned long startMillis = millis();
	for (uint16_t x = 0; x < SSD1322_SCREEN_WIDTH; x++)
	{
		for (uint16_t y = 0; y < SSD1322_SCREEN_HEIGHT; y++)
		{
			uint16_t index = x / 2 + y * SSD1322_SCREEN_WIDTH / 2;
			ssd1322.drawPixel(x, y, max(0, 0xF - abs(bar - x)));
		}
	}

	ssd1322.push();

	bar++;
	if (bar >= SSD1322_SCREEN_WIDTH)
	{
		bar = 0;
	}
}
