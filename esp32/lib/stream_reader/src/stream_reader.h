#pragma once

#include "stream_wrapper.h"
#include "display_driver.h"

class StreamReader
{
public:
    void init(StreamWrapper *streamWrapper);
    bool draw(DisplayDriver *displayDriver, const uint32_t imageIndex, const uint32_t wipeFrameDuration);
    uint32_t getWidth();
    uint32_t getHeight();
    uint32_t getImageCount();

private:
    StreamWrapper *streamWrapper;
    uint32_t width;
    uint32_t height;
    uint32_t imageCount;
    uint32_t headerSize;

    uint32_t lastImageIndex;
    uint32_t frameIndex;

    void updateFrameIndex(DisplayDriver *displayDriver, bool newImage, uint32_t frameCount);
    void decodePackBits(DisplayDriver *displayDriver, uint32_t sameColumnCount, uint32_t animatedColumnCount);
    void drawByte(DisplayDriver *displayDriver, uint16_t decodedIndex, uint8_t byte, uint32_t sameColumnCount, uint32_t animatedColumnCount);
};
