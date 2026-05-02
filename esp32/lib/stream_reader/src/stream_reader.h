#pragma once

#include "stream_wrapper.h"
#include "display_driver.h"

class StreamReader
{
public:
    void init(StreamWrapper *streamWrapper);
    bool draw(DisplayDriver *displayDriver, const uint32_t imageIndex);
    uint32_t getWidth();
    uint32_t getHeight();
    uint32_t getImageCount();

private:
    StreamWrapper *streamWrapper;
    uint32_t width;
    uint32_t height;
    uint32_t imageCount;
    uint32_t headerSize;
    float scaleX;
    float scaleY;

    uint32_t lastImageIndex;
    uint32_t frameIndex;

    void updateFrameIndex(DisplayDriver *displayDriver, uint32_t offsetX, uint32_t offsetY, bool newImage, uint32_t frameCount);
    void decodePackBits(DisplayDriver *displayDriver, uint32_t offsetX, uint32_t offsetY, uint32_t sameColumnCount, uint32_t animatedColumnCount);
    void drawByte(DisplayDriver *displayDriver, uint32_t offsetX, uint32_t offsetY, uint16_t decodedIndex, uint8_t byte, uint32_t sameColumnCount, uint32_t animatedColumnCount);
};
