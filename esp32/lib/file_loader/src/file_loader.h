#pragma once

#include "display_driver.h"
#include <LittleFS.h>

class FileLoader
{
public:
    FileLoader(const char *fileName, DisplayDriver *displayDriver);
    bool init();
    void load(uint32_t index);
    uint32_t getWidth();
    uint32_t getHeight();
    uint32_t getImageCount();

private:
    const char *fileName;
    DisplayDriver *displayDriver;
    File file;
    uint32_t width;
    uint32_t height;
    uint32_t imageCount;

    void drawByte(uint16_t decodedIndex, uint8_t byte);
};
