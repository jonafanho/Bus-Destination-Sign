#include "display_driver.h"

DisplayDriver::DisplayDriver(const uint16_t screenWidth, const uint16_t screenHeight, const bool rotated, const bool hasWipe) : screenWidth(screenWidth), screenHeight(screenHeight), rotated(rotated), hasWipe(hasWipe)
{
    buffer = std::vector<uint8_t>(screenWidth * screenHeight / 2);
    wipeBuffer = std::vector<uint8_t>(screenWidth * screenHeight / 2);
}

bool DisplayDriver::init()
{
    gpio_set_direction(PIN_SCREEN_ENABLE, GPIO_MODE_OUTPUT);
    GPIO.out_w1ts = (1 << PIN_SCREEN_ENABLE);
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

void DisplayDriver::startWipe()
{
    isWiping = hasWipe;
    clear();
}

void DisplayDriver::drawPixel(uint16_t x, uint16_t y, uint8_t brightness, bool replace)
{
    if (x >= screenWidth || y >= screenHeight)
    {
        return;
    }

    uint16_t rotatedX = getRotatedX(x);
    uint16_t rotatedY = getRotatedY(y);
    uint16_t index = rotatedX / 2 + rotatedY * screenWidth / 2;
    std::vector<uint8_t> &currentBuffer = isWiping ? wipeBuffer : buffer;

    if (rotatedX % 2 == 0)
    {
        currentBuffer[index] = ((brightness & 0x0F) << 4) | (currentBuffer[index] & (replace ? 0x0F : 0xFF));
    }
    else
    {
        currentBuffer[index] = (currentBuffer[index] & (replace ? 0xF0 : 0xFF)) | (brightness & 0x0F);
    }
}

void DisplayDriver::push()
{
    for (uint16_t x = 0; x < screenWidth; x++)
    {
        if (isWiping)
        {
            uint16_t rotatedX = getRotatedX(x);
            uint16_t index1 = rotatedX / 2;
            uint16_t index2 = screenWidth / 2;
            bool isEven = rotatedX % 2 == 0;

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

        while (esp_timer_get_time() - lastFrameMicros < (isWiping ? WIPE_FRAME_DURATION : targetFrameDuration))
        {
            vTaskDelay(1);
        }

        lastFrameMicros = esp_timer_get_time();
        pushRaw();

        if (!isWiping)
        {
            return;
        }
    }

    isWiping = false;
}

void DisplayDriver::setTargetFrameDuration(uint32_t targetFrameDuration)
{
    this->targetFrameDuration = targetFrameDuration;
}

uint16_t DisplayDriver::getRotatedX(const uint16_t x)
{
    return rotated ? screenWidth - x - 1 : x;
}

uint16_t DisplayDriver::getRotatedY(const uint16_t y)
{
    return rotated ? screenHeight - y - 1 : y;
}
