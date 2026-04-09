#include "display_driver.h"

DisplayDriver::DisplayDriver(const uint16_t screenWidth, const uint16_t screenHeight, const gpio_num_t pinScreenEnable) : screenWidth(screenWidth), screenHeight(screenHeight), pinScreenEnable(pinScreenEnable)
{
    buffer = std::vector<uint8_t>(screenWidth * screenHeight / 2);
    wipeBuffer = std::vector<uint8_t>(screenWidth * screenHeight / 2);
}

bool DisplayDriver::init()
{
    gpio_set_direction(pinScreenEnable, GPIO_MODE_OUTPUT);
    GPIO.out_w1ts = (1 << pinScreenEnable);
    vTaskDelay(100);
    return initRaw();
}

void DisplayDriver::clear()
{
    for (uint16_t x = 0; x < screenWidth; x++)
    {
        for (uint16_t y = 0; y < screenHeight; y++)
        {
            drawPixel(x, y, 0);
        }
    }
}

void DisplayDriver::startWipe(uint32_t wipeFrameDuration)
{
    this->wipeFrameDuration = wipeFrameDuration;
    clear();
}

void DisplayDriver::drawPixel(uint16_t x, uint16_t y, uint8_t brightness)
{
    if (x >= screenWidth || y >= screenHeight)
    {
        return;
    }

    uint16_t index = x / 2 + y * screenWidth / 2;
    std::vector<uint8_t> &currentBuffer = wipeFrameDuration > 0 ? wipeBuffer : buffer;

    if (x % 2 == 0)
    {
        currentBuffer[index] = ((brightness & 0x0F) << 4) | (currentBuffer[index] & 0x0F);
    }
    else
    {
        currentBuffer[index] = (currentBuffer[index] & 0xF0) | (brightness & 0x0F);
    }
}

void DisplayDriver::push()
{
    for (uint16_t x = 0; x < screenWidth; x++)
    {
        if (wipeFrameDuration > 0)
        {
            uint16_t index1 = x / 2;
            uint16_t index2 = screenWidth / 2;
            bool isEven = x % 2 == 0;

            for (uint16_t y = 0; y < screenHeight; y++)
            {
                uint16_t index = index1 + y * index2;

                if (isEven)
                {
                    buffer[index] = (wipeBuffer[index] & 0xF0) | (buffer[index] & 0x0F);
                }
                else
                {
                    buffer[index] = (buffer[index] & 0xF0) | (wipeBuffer[index] & 0x0F);
                }
            }
        }

        while (esp_timer_get_time() - lastFrameMicros < (wipeFrameDuration > 0 ? wipeFrameDuration : targetFrameDuration))
        {
            vTaskDelay(1);
        }

        lastFrameMicros = esp_timer_get_time();
        pushRaw();

        if (wipeFrameDuration == 0)
        {
            return;
        }
    }

    wipeFrameDuration = 0;
}

void DisplayDriver::setTargetFrameDuration(uint32_t targetFrameDuration)
{
    this->targetFrameDuration = targetFrameDuration;
}
