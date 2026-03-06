#include <Arduino.h>
#include <init_print.h>
#include <spi_master.h>
#include <display_transaction_master.h>

InitPrint initPrint("Main");
SPIMaster spiMaster1;
DisplayTransactionMaster displayTransactionMaster1(&spiMaster1, 0);

constexpr gpio_num_t PIN_LED_RED_1 = GPIO_NUM_1;
constexpr gpio_num_t PIN_LED_YELLOW_1 = GPIO_NUM_2;
constexpr gpio_num_t PIN_LED_GREEN_1 = GPIO_NUM_3;
constexpr gpio_num_t PIN_LED_RED_2 = GPIO_NUM_4;
constexpr gpio_num_t PIN_LED_YELLOW_2 = GPIO_NUM_5;
constexpr gpio_num_t PIN_LED_GREEN_2 = GPIO_NUM_6;

void setStatusLights(bool red1, bool yellow1, bool green1, bool red2, bool yellow2, bool green2)
{
	gpio_set_level(PIN_LED_RED_1, red1);
	gpio_set_level(PIN_LED_YELLOW_1, yellow1);
	gpio_set_level(PIN_LED_GREEN_1, green1);
	gpio_set_level(PIN_LED_RED_2, red2);
	gpio_set_level(PIN_LED_YELLOW_2, yellow2);
	gpio_set_level(PIN_LED_GREEN_2, green2);
}

void setup()
{
	gpio_set_direction(PIN_LED_RED_1, GPIO_MODE_OUTPUT);
	gpio_set_direction(PIN_LED_YELLOW_1, GPIO_MODE_OUTPUT);
	gpio_set_direction(PIN_LED_GREEN_1, GPIO_MODE_OUTPUT);
	gpio_set_direction(PIN_LED_RED_2, GPIO_MODE_OUTPUT);
	gpio_set_direction(PIN_LED_YELLOW_2, GPIO_MODE_OUTPUT);
	gpio_set_direction(PIN_LED_GREEN_2, GPIO_MODE_OUTPUT);

	setStatusLights(false, false, false, false, false, true);
	delay(500);
	setStatusLights(false, false, false, false, true, false);
	delay(500);
	setStatusLights(false, false, false, true, false, false);
	delay(500);
	setStatusLights(false, false, true, false, false, false);
	delay(500);
	setStatusLights(false, true, false, false, false, false);
	delay(500);
	setStatusLights(true, false, false, false, false, false);
	delay(500);

	initPrint.init(SPIMaster::initBus(), "SPI bus");
	initPrint.init(spiMaster1.init(), "SPI device");
	initPrint.init(DisplayTransactionMaster::initSD(), "SD card");
	initPrint.init(displayTransactionMaster1.init(), "SD file structure");
}

void loop()
{
	setStatusLights(false, false, false, false, false, true);
	displayTransactionMaster1.nextDisplay();
	delay(1000);
	setStatusLights(false, false, false, false, false, false);
	delay(15000);
}
