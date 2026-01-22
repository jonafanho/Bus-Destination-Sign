#include <Arduino.h>
#include <init_print.h>
#include <spi_slave.h>
#include <ssd1322.h>
#include <display_transaction_slave.h>

InitPrint initPrint("Display");
SPISlave spiSlave;
SSD1322 ssd1322;
DisplayTransactionSlave displayTransactionSlave(&spiSlave, &ssd1322);

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
	initPrint.init(spiSlave.init(), "SPI device");
	initPrint.init(ssd1322.init(), "SSD1322");
	xTaskCreatePinnedToCore(spiTask, "SPI", 4096, NULL, 2, NULL, 0);
}

void loop()
{
	displayTransactionSlave.displayTick();
}
