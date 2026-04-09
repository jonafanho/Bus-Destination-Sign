#pragma once

#include "display_driver.h"
#include <LittleFS.h>

class FileLoader
{
public:
    FileLoader(const char *fileName, const uint32_t imageDuration, const uint32_t wipeFrameDuration, DisplayDriver *displayDriver);
    bool init();
    bool load(uint32_t imageIndex);
    uint32_t getWidth();
    uint32_t getHeight();
    uint32_t getImageCount();

private:
    const char *fileName;
    const uint32_t imageDuration;
    const uint32_t wipeFrameDuration;
    DisplayDriver *displayDriver;

    File file;
    uint32_t width;
    uint32_t height;
    uint32_t imageCount;
    uint32_t headerSize;

    uint32_t lastImageIndex;
    uint32_t frameIndex;

    uint8_t readByte();
    uint32_t readInt();
    void updateFrameIndex(bool newImage, uint32_t frameCount);
    void decodePackBits(uint32_t sameColumnCount, uint32_t animatedColumnCount);
    void drawByte(uint16_t decodedIndex, uint8_t byte, uint32_t sameColumnCount, uint32_t animatedColumnCount);
};
