#include <Arduino.h>
#include <init_print.h>
#include <spi_slave.h>
#include <ssd1322.h>
#include <ssd1327.h>
#include <display_transaction_slave.h>
#include <stream_reader.h>

InitPrint initPrint("Display");
SPISlave spiSlave;
SSD1322 ssd1322(false, false);
SSD1327 ssd1327(false, false);
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
	initPrint.init(ssd1322.init(), "SSD1322");

	xTaskCreatePinnedToCore(spiTask, "SPI", 4096, NULL, 2, NULL, 0);
}

void loop()
{
	displayTransactionSlave.tick(&spiSlave, &streamReader, &ssd1322);
}
