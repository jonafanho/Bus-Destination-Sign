#include "display_driver.h"

DisplayDriver::DisplayDriver(const uint16_t screenWidth, const uint16_t screenHeight, const gpio_num_t pinScreenEnable) : screenWidth(screenWidth), screenHeight(screenHeight), pinScreenEnable(pinScreenEnable)
{
    buffer = std::vector<uint8_t>(screenWidth * screenHeight / 2);
}

bool DisplayDriver::init()
{
    gpio_set_direction(pinScreenEnable, GPIO_MODE_OUTPUT);
    GPIO.out_w1ts = (1 << pinScreenEnable);
    vTaskDelay(100);
    return initRaw();
}

void DisplayDriver::drawPixel(uint16_t x, uint16_t y, uint8_t brightness)
{
    if (x >= screenWidth || y >= screenHeight)
    {
        return;
    }

    uint16_t index = x / 2 + y * screenWidth / 2;

    if (x % 2 == 0)
    {
        buffer[index] = ((brightness & 0x0F) << 4) | (buffer[index] & 0x0F);
    }
    else
    {
        buffer[index] = (buffer[index] & 0xF0) | (brightness & 0x0F);
    }
}

void DisplayDriver::push()
{
    while (esp_timer_get_time() - lastFrameMicros < targetFrameDuration)
    {
        vTaskDelay(1);
    }
    lastFrameMicros = esp_timer_get_time();
    pushRaw();
}

void DisplayDriver::setTargetFrameDuration(uint32_t targetFrameDuration)
{
    this->targetFrameDuration = targetFrameDuration;
}
