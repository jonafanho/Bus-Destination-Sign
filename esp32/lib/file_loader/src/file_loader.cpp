#include "file_loader.h"

FileLoader::FileLoader(const char *fileName, DisplayDriver *displayDriver) : fileName(fileName), displayDriver(displayDriver) {}

bool FileLoader::init()
{
    file = LittleFS.open(fileName, "r");
    width = readInt();
    height = readInt();
    imageCount = readInt();
    return file;
}

bool FileLoader::load(uint32_t imageIndex)
{
    uint32_t offset;
    file.seek(sizeof(width) + sizeof(height) + sizeof(imageCount) + imageIndex * sizeof(offset));
    offset = readInt();
    file.seek(offset);
    uint8_t displayType = readByte();

    switch (displayType)
    {
    case 0: // Generic image
    {
        decodePackBits(width, 0);
        displayDriver->push();
        displayDriver->setTargetFrameDuration(1000000);
        return true;
    }
    case 1: // Generic animated
    {
        uint32_t frameCount = readInt();

        if (imageIndex != lastImageIndex || frameIndex >= frameCount)
        {
            clearScreen();
        }

        file.seek(offset + sizeof(displayType) + sizeof(frameCount) + frameIndex * sizeof(offset));
        offset = readInt();
        file.seek(offset);

        uint32_t frameDuration = readInt();
        decodePackBits(width, 0);

        lastImageIndex = imageIndex;
        frameIndex++;
        displayDriver->push();
        displayDriver->setTargetFrameDuration(frameDuration);
        return frameIndex == frameCount;
    }
    case 2: // Standard scroll
    {
        uint32_t sameColumnCount = readInt();
        uint32_t animatedColumnCount = readInt();
        uint32_t frameCount = animatedColumnCount + width - sameColumnCount;

        if (imageIndex != lastImageIndex || frameIndex >= frameCount)
        {
            clearScreen();
        }

        decodePackBits(sameColumnCount, animatedColumnCount);

        lastImageIndex = imageIndex;
        frameIndex++;
        displayDriver->push();
        displayDriver->setTargetFrameDuration(30000);
        return frameIndex == frameCount;
    }
    default:
    {
        return true;
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

uint8_t FileLoader::readByte()
{
    uint8_t result;
    file.readBytes((char *)&result, sizeof(result));
    return result;
}

uint32_t FileLoader::readInt()
{
    uint32_t result;
    file.readBytes((char *)&result, sizeof(result));
    return result;
}

void FileLoader::decodePackBits(uint32_t sameColumnCount, uint32_t animatedColumnCount)
{
    uint16_t decodedIndex = 0;
    while (decodedIndex < (sameColumnCount + animatedColumnCount) * height / 8)
    {
        int8_t header = readByte();
        if (header >= 0)
        {
            // Literal run
            for (int i = 0; i < header + 1; i++)
            {
                drawByte(decodedIndex++, readByte(), sameColumnCount, animatedColumnCount);
            }
        }
        else if (header > -128)
        {
            // Repeated bytes
            uint8_t value = readByte();
            for (int i = 0; i < 1 - header; i++)
            {
                drawByte(decodedIndex++, value, sameColumnCount, animatedColumnCount);
            }
        }
    }
}

void FileLoader::drawByte(uint16_t decodedIndex, uint8_t byte, uint32_t sameColumnCount, uint32_t animatedColumnCount)
{
    uint32_t base = decodedIndex * 8;
    uint32_t rawWidth = sameColumnCount + animatedColumnCount;

    // TODO maybe remove dependency on display
    for (uint8_t i = 0; i < 8; i++)
    {
        uint32_t x = (base + i) % rawWidth;
        uint32_t y = (base + i) / rawWidth;
        bool isLastColumn = x == rawWidth - 1;

        if (x >= sameColumnCount)
        {
            x += width - sameColumnCount - frameIndex;
            if (x < sameColumnCount || x >= width)
            {
                continue;
            }
        }

        displayDriver->drawPixel(x, y, (byte >> i) & 1 > 0 ? 0x0F : 0);

        if (isLastColumn && x < width - 1)
        {
            displayDriver->drawPixel(x + 1, y, 0);
        }
    }
}

void FileLoader::clearScreen()
{
    frameIndex = 0;
    for (uint16_t x = 0; x < width; x++)
    {
        for (uint16_t y = 0; y < height; y++)
        {
            displayDriver->drawPixel(x, y, 0);
        }
    }
}
