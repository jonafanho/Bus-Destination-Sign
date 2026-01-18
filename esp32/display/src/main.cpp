#include <spi_slave.h>
#include "ssd1322.h"

SPISlave spiSlave;
SSD1322 ssd1322;
uint16_t bar = 0;
uint16_t offset = 0;

void spiTask(void *pvParameters)
{
	while (true)
	{
		spiSlave.tick();
		vTaskDelay(1);
	}
}

void setup()
{
	Serial.begin(9600);
	Serial.setTimeout(5000);
	Serial.println();

	if (spiSlave.init())
	{
		Serial.println("SPI setup successful");
	}
	else
	{
		Serial.println("SPI setup failed");
		while (true)
		{
			delay(1000);
		}
	}

	ssd1322.init();
	ssd1322.setTargetFramesPerSecond(SSD1322::SCREEN_WIDTH);

	xTaskCreatePinnedToCore(spiTask, "SPI", 4096, NULL, 2, NULL, 0);
}

void loop()
{
	SPISlave::SPIMessage spiMessage;
	if (xQueueReceive(spiSlave.messageQueue, &spiMessage, 0))
	{
		// TODO
		Serial.println("Received message");
		Serial.println(spiMessage.buffer[0]);
		Serial.println(spiMessage.buffer[1]);
		offset = spiMessage.buffer[0];
		free(spiMessage.buffer);
	}

	unsigned long startMillis = millis();
	for (uint16_t x = 0; x < SSD1322::SCREEN_WIDTH; x++)
	{
		for (uint16_t y = 0; y < SSD1322::SCREEN_HEIGHT / 2; y++)
		{
			uint16_t index = x / 2 + y * SSD1322::SCREEN_WIDTH / 2;
			ssd1322.drawPixel(x, (y + offset) % SSD1322::SCREEN_HEIGHT, max(0, 0xF - abs(bar - x)));
		}
	}

	ssd1322.push();

	bar++;
	if (bar >= SSD1322::SCREEN_WIDTH)
	{
		bar = 0;
	}
}
