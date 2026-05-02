#include <Arduino.h>
#include <LittleFS.h>
#include <init_print.h>
#include <spi_master.h>
#include <display_transaction_master.h>
#include "server_handler.h"

InitPrint initPrint("Main");
SPIMaster spiMaster1(GPIO_NUM_1);
SPIMaster spiMaster2(GPIO_NUM_2);
SPIMaster spiMaster3(GPIO_NUM_3);
DisplayTransactionMaster displayTransactionMaster1(0);
DisplayTransactionMaster displayTransactionMaster2(1);
DisplayTransactionMaster displayTransactionMaster3(2);
ServerHandler serverHandler;

constexpr gpio_num_t PIN_LED_RED = GPIO_NUM_4;
constexpr gpio_num_t PIN_LED_YELLOW = GPIO_NUM_5;
constexpr gpio_num_t PIN_LED_GREEN = GPIO_NUM_6;

void setStatusLights(bool red, bool yellow, bool green)
{
	gpio_set_level(PIN_LED_RED, red);
	gpio_set_level(PIN_LED_YELLOW, yellow);
	gpio_set_level(PIN_LED_GREEN, green);
}

void setup()
{
	Serial.begin(115200);
	Serial.println("");

	gpio_set_direction(PIN_LED_RED, GPIO_MODE_OUTPUT);
	gpio_set_direction(PIN_LED_YELLOW, GPIO_MODE_OUTPUT);
	gpio_set_direction(PIN_LED_GREEN, GPIO_MODE_OUTPUT);

	setStatusLights(false, false, true);
	delay(500);
	setStatusLights(false, true, false);
	delay(500);
	setStatusLights(true, false, false);
	delay(500);

	initPrint.init(LittleFS.begin() || (LittleFS.format() && LittleFS.begin()), "LittleFS");
	initPrint.init(SPIMaster::initBus(), "SPI bus");
	initPrint.init(spiMaster1.init(), "SPI device 1");
	initPrint.init(spiMaster2.init(), "SPI device 2");
	initPrint.init(spiMaster3.init(), "SPI device 3");
	initPrint.init(DisplayTransactionMaster::initSD(), "SD card");
	initPrint.init(displayTransactionMaster1.init(), "SD file structure 1");
	initPrint.init(displayTransactionMaster2.init(), "SD file structure 2");
	initPrint.init(displayTransactionMaster3.init(), "SD file structure 3");

	serverHandler.init();
	setStatusLights(false, false, false);
}

unsigned long nextDisplayMillis = 0;

void loop()
{
	serverHandler.tick();

	if (millis() >= nextDisplayMillis)
	{
		setStatusLights(false, false, true);
		displayTransactionMaster1.nextDisplay(&spiMaster1);
		displayTransactionMaster2.nextDisplay(&spiMaster2);
		displayTransactionMaster3.nextDisplay(&spiMaster3);
		nextDisplayMillis = millis() + 5000;
		setStatusLights(false, false, false);
	}
}
