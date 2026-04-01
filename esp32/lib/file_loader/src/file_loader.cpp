#include "file_loader.h"

FileLoader::FileLoader(const char *fileName, DisplayDriver *displayDriver) : fileName(fileName), displayDriver(displayDriver) {}

bool FileLoader::init()
{
    file = LittleFS.open(fileName, "r");
    file.readBytes((char *)&width, sizeof(width));
    file.readBytes((char *)&height, sizeof(height));
    file.readBytes((char *)&imageCount, sizeof(imageCount));
    return file;
}

void FileLoader::load(uint32_t index)
{
    uint32_t offset;
    file.seek(sizeof(width) + sizeof(height) + sizeof(imageCount) + index * sizeof(offset));
    file.readBytes((char *)&offset, sizeof(offset));
    file.seek(offset);
    uint16_t decodedIndex = 0;

    while (decodedIndex < width * height / 8)
    {
        int8_t header;
        file.readBytes((char *)&header, sizeof(header));

        if (header >= 0)
        {
            // Literal run
            for (int i = 0; i < header + 1; i++)
            {
                uint8_t byte;
                file.readBytes((char *)&byte, sizeof(byte));
                drawByte(decodedIndex++, byte);
            }
        }
        else if (header > -128)
        {
            // Repeated bytes
            uint8_t byte;
            file.readBytes((char *)&byte, sizeof(byte));
            for (int i = 0; i < 1 - header; i++)
            {
                drawByte(decodedIndex++, byte);
            }
        }
    }
}

uint32_t FileLoader::getWidth()
{
    return width;
}

uint32_t FileLoader::getHeight()
{
    return height;
}

uint32_t FileLoader::getImageCount()
{
    return imageCount;
}

void FileLoader::drawByte(uint16_t decodedIndex, uint8_t byte)
{
    uint16_t base = decodedIndex * 8;
    uint16_t y = base / width;
    uint16_t xStart = base % width;

    // TODO maybe remove dependency on display
    for (uint8_t i = 0; i < 8; i++)
    {
        uint16_t x = xStart + i;
        for (uint8_t j = 0; j < 2; j++)
            for (uint8_t k = 0; k < 2; k++)
                displayDriver->drawPixel(x * 2 + j, y * 2 + k, (byte >> i) & 1 > 0 ? (j + k) * 3 + 2 : 0);
    }
}
