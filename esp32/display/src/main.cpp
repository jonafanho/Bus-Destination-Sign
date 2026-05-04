#include <Arduino.h>
#include <init_print.h>
#include <spi_slave.h>
#include <display_transaction_slave.h>
#include <stream_reader.h>

#define DISPLAY_SSD1327
#define DISPLAY_ROTATED false
#define DISPLAY_HAS_WIPE true
#define DISPLAY_PIXELATED_TYPE 0

#if defined(DISPLAY_SSD1327)
#include <ssd1327.h>
SSD1327 displayDriver(DISPLAY_ROTATED, DISPLAY_HAS_WIPE, DISPLAY_PIXELATED_TYPE);
#elif defined(DISPLAY_SSD1322)
#include <ssd1322.h>
SSD1322 displayDriver(DISPLAY_ROTATED, DISPLAY_HAS_WIPE, DISPLAY_PIXELATED_TYPE);
#endif

InitPrint initPrint("Display");
SPISlave spiSlave;
DisplayTransactionSlave displayTransactionSlave;
StreamReader streamReader;

void spiTask(void *pvParameters)
{
	while (true)
	{
		spiSlave.tick();
		delay(1);
	}
}

void setup()
{
	Serial.begin(115200);
	Serial.println("");

	initPrint.init(spiSlave.init(), "SPI device");
	initPrint.init(displayDriver.init(), "Display driver");

	xTaskCreatePinnedToCore(spiTask, "SPI", 4096, NULL, 2, NULL, 0);
}

void loop()
{
	displayTransactionSlave.tick(&spiSlave, &streamReader, &displayDriver);
}
