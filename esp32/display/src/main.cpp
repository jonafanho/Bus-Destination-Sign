#include <Arduino.h>
#include <LittleFS.h>
#include <init_print.h>
#include <spi_slave.h>
#include <ssd1322.h>
#include <display_transaction_slave.h>
#include <stream_reader.h>

InitPrint initPrint("Display");
SPISlave spiSlave;
SSD1322 ssd1322;
DisplayTransactionSlave displayTransactionSlave;
StreamReader *defaultStreamReaders = new StreamReader[1]{StreamReader()};

uint32_t imageIndex;

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

	FileStreamWrapper defaultFileStreamWrapper1 = FileStreamWrapper();

	initPrint.init(LittleFS.begin(), "LittleFS");
	initPrint.init(spiSlave.init(), "SPI device");
	initPrint.init(ssd1322.init(), "SSD1322");
	initPrint.init(defaultFileStreamWrapper1.init("/displays.dat"), "Display data");

	defaultStreamReaders[0].init(&defaultFileStreamWrapper1);

	xTaskCreatePinnedToCore(spiTask, "SPI", 4096, NULL, 2, NULL, 0);
}

void loop()
{
	displayTransactionSlave.tick(&spiSlave, defaultStreamReaders, &ssd1322);
}
