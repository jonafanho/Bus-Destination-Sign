#include <Arduino.h>
#include <LittleFS.h>
#include <init_print.h>
#include <spi_slave.h>
#include <ssd1322.h>
#include <display_transaction_slave.h>
#include <file_loader.h>

InitPrint initPrint("Display");
SPISlave spiSlave;
SSD1322 ssd1322;
DisplayTransactionSlave displayTransactionSlave(&spiSlave, &ssd1322);
FileLoader fileLoader("/displays.dat", 500000, 5000, &ssd1322);

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

	initPrint.init(LittleFS.begin(), "LittleFS");
	initPrint.init(spiSlave.init(), "SPI device");
	initPrint.init(ssd1322.init(), "SSD1322");
	initPrint.init(fileLoader.init(), "File loader");

	xTaskCreatePinnedToCore(spiTask, "SPI", 4096, NULL, 2, NULL, 0);
}

void loop()
{
	// displayTransactionSlave.displayTick();

	if (fileLoader.load(imageIndex))
	{
		imageIndex = rand() % fileLoader.getImageCount();
	}
}
