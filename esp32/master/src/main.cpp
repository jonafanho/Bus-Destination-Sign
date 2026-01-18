#include <Arduino.h>
#include <spi_master.h>

SPIMaster spiMaster;
static constexpr uint8_t PIN_BUTTON = 26;

void setup()
{
	Serial.begin(9600);
	Serial.setTimeout(5000);
	Serial.println();

	pinMode(PIN_BUTTON, INPUT_PULLUP);

	if (spiMaster.init())
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
}

uint8_t value = 0;

void loop()
{
	if (digitalRead(PIN_BUTTON) == LOW)
	{
		const uint8_t message[] = {value, 0xFF - value};

		if (spiMaster.send(message, 8))
		{
			Serial.println("SPI message sent successfully");
		}
		else
		{
			Serial.println("Failed to send SPI message");
		}

		value++;

		while (digitalRead(PIN_BUTTON) == LOW)
		{
			delay(10);
		}

		delay(100);
	}
}
