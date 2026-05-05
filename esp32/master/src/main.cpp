#include <Arduino.h>
#include <LittleFS.h>
#include <init_print.h>
#include <spi_master.h>
#include <display_transaction_master.h>
#include "server_handler.h"
#include "settings.h"

InitPrint initPrint("Main");
SPIMaster spiMaster1(GPIO_NUM_1);
SPIMaster spiMaster2(GPIO_NUM_2);
SPIMaster spiMaster3(GPIO_NUM_3);
DisplayTransactionMaster displayTransactionMaster1(0);
DisplayTransactionMaster displayTransactionMaster2(1);
DisplayTransactionMaster displayTransactionMaster3(2);
ServerHandler serverHandler;
Settings settings;

constexpr gpio_num_t PIN_LED_RED = GPIO_NUM_4;
constexpr gpio_num_t PIN_LED_YELLOW = GPIO_NUM_5;
constexpr gpio_num_t PIN_LED_GREEN = GPIO_NUM_6;

void setStatusLights(bool red, bool yellow, bool green)
{
	digitalWrite(PIN_LED_RED, red);
	digitalWrite(PIN_LED_YELLOW, yellow);
	digitalWrite(PIN_LED_GREEN, green);
}

void setup()
{
	Serial.begin(115200);
	Serial.println("");

	pinMode(PIN_LED_RED, OUTPUT);
	pinMode(PIN_LED_YELLOW, OUTPUT);
	pinMode(PIN_LED_GREEN, OUTPUT);

	setStatusLights(false, false, true);
	delay(500);
	setStatusLights(false, true, false);
	delay(500);
	setStatusLights(true, false, false);
	delay(500);

	initPrint.init(LittleFS.begin() || (LittleFS.format() && LittleFS.begin()), "LittleFS");
	initPrint.init(spiMaster1.init(), "SPI device 1");
	initPrint.init(spiMaster2.init(), "SPI device 2");
	initPrint.init(spiMaster3.init(), "SPI device 3");
	initPrint.init(SPIMaster::initBus(), "SPI bus and SD card");
	initPrint.init(displayTransactionMaster1.init(), "SD file structure 1");
	initPrint.init(displayTransactionMaster2.init(), "SD file structure 2");
	initPrint.init(displayTransactionMaster3.init(), "SD file structure 3");

	serverHandler.init(&settings);
	setStatusLights(false, false, false);
}

unsigned long nextDisplayMillis = 0;

void loop()
{
	serverHandler.tick(&settings);

	if (millis() >= nextDisplayMillis)
	{
		setStatusLights(false, false, true);
		displayTransactionMaster1.nextDisplay(&spiMaster1);
		displayTransactionMaster2.nextDisplay(&spiMaster2);
		displayTransactionMaster3.nextDisplay(&spiMaster3);
		nextDisplayMillis = millis() + 15000;
		setStatusLights(false, false, false);
	}
}
