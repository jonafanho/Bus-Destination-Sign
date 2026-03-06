#include "display_transaction_slave.h"
#include "display_driver.h"
#include <vector>

DisplayTransactionSlave::DisplayTransactionSlave(SPISlave *spiSlave, DisplayDriver *displayDriver) : spiSlave(spiSlave), displayDriver(displayDriver) {}

void DisplayTransactionSlave::displayTick()
{
    uint8_t *buffer = nullptr;
    if (xQueueReceive(spiSlave->messageQueue, &buffer, 0))
    {
        switch (buffer[0])
        {
        case FUNCTION_SCREEN_OFF:
            // TODO
            break;
        case FUNCTION_SCREEN_ON:
            // TODO
            break;
        case FUNCTION_NEXT_DISPLAY:
            processNextDisplay(buffer + 1);
            break;
        }

        free(buffer);
    }

    if (totalImageDuration > 0)
    {
        uint16_t currentMillis = ((esp_timer_get_time() - offsetMicros) / 1000) % totalImageDuration;
        uint16_t elapsedMillis = 0;

        for (uint8_t i = 0; i < imagesInGroup; i++)
        {
            uint16_t endMillis = elapsedMillis + displayDurationList[i];

            if (currentMillis >= elapsedMillis && currentMillis < endMillis)
            {
                uint16_t imageWidth = widthList[i];
                uint16_t x = 0;
                uint16_t y = 0;
                uint16_t wipeX = wipeSpeedList[i] == 0 ? displayDriver->screenWidth : (currentMillis - elapsedMillis) / wipeSpeedList[i];
                bool hasScroll = imageWidth > 0;
                uint16_t scrollWidth = displayDriver->screenWidth - scrollLeftAnchorList[i] - scrollRightAnchorList[i];
                uint16_t scrollX = ((currentMillis - elapsedMillis) / 5) % (scrollWidth + imageWidth - scrollLeftAnchorList[i] - scrollRightAnchorList[i]);

                if (hasScroll)
                {
                    for (uint16_t x2 = 0; x2 < wipeX; x2++)
                        for (uint16_t y2 = 0; y2 < displayDriver->screenHeight; y2++)
                            displayDriver->drawPixel(x2, y2, 0);
                }

                for (uint16_t j = 0; j < imageBytesLengthList[i]; j++)
                {
                    for (uint8_t k = 0; k <= (imageBufferList[i][j] & 0xF); k++)
                    {
                        uint16_t actualX;
                        if (hasScroll)
                        {
                            if (x < scrollLeftAnchorList[i])
                            {
                                actualX = x;
                            }
                            else if (x >= imageWidth - scrollRightAnchorList[i])
                            {
                                actualX = x + displayDriver->screenWidth - imageWidth;
                            }
                            else
                            {
                                uint16_t rawX = x + scrollWidth;
                                uint16_t rawX2 = rawX - min(scrollX, rawX);
                                actualX = rawX2 < scrollLeftAnchorList[i] || rawX2 >= displayDriver->screenWidth - scrollRightAnchorList[i] ? displayDriver->screenWidth : rawX2;
                            }
                        }
                        else
                        {
                            actualX = x;
                        }

                        if (actualX <= wipeX)
                        {
                            displayDriver->drawPixel(actualX, y, imageBufferList[i][j] >> 4);
                        }

                        x++;
                        if (x >= (imageWidth == 0 ? displayDriver->screenWidth : imageWidth))
                        {
                            x = 0;
                            y++;
                        }
                    }
                }

                displayDriver->push();
                break;
            }

            elapsedMillis = endMillis;
        }
    }
}

void DisplayTransactionSlave::processNextDisplay(const uint8_t *data)
{
    offsetMicros = esp_timer_get_time();
    totalImageDuration = 0;
    imagesInGroup = data[0];
    uint32_t cursor = 1;

    if (imagesInGroup > MAX_DISPLAYS_IN_GROUP)
    {
        return;
    }

    for (uint8_t i = 0; i < imagesInGroup; i++)
    {
        displayDurationList[i] = getValue(data + cursor);
        cursor += 2;
        wipeSpeedList[i] = getValue(data + cursor);
        cursor += 2;
        widthList[i] = getValue(data + cursor);
        cursor += 2;
        scrollLeftAnchorList[i] = getValue(data + cursor);
        cursor += 2;
        scrollRightAnchorList[i] = getValue(data + cursor);
        cursor += 2;
        imageBytesLengthList[i] = getValue(data + cursor);
        cursor += 2;

        if (imageBytesLengthList[i] > MAX_IMAGE_BUFFER_SIZE)
        {
            return;
        }

        memcpy(imageBufferList[i].data(), data + cursor, imageBytesLengthList[i]);
        cursor += imageBytesLengthList[i];
        totalImageDuration += displayDurationList[i];
    }
}

uint16_t DisplayTransactionSlave::getValue(const uint8_t *data)
{
    return (static_cast<uint16_t>(data[0]) << 8) + data[1];
}
