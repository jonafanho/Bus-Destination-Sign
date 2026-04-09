#include "file_loader.h"

FileLoader::FileLoader(const char *fileName, const uint32_t imageDuration, const uint32_t wipeFrameDuration, DisplayDriver *displayDriver) : fileName(fileName), imageDuration(imageDuration), wipeFrameDuration(wipeFrameDuration), displayDriver(displayDriver) {}

bool FileLoader::init()
{
    file = LittleFS.open(fileName, "r");
    width = readInt();
    height = readInt();
    imageCount = readInt();
    headerSize = sizeof(width) + sizeof(height) + sizeof(imageCount);
    return file;
}

bool FileLoader::load(uint32_t imageIndex)
{
    bool newImage = imageIndex != lastImageIndex;
    lastImageIndex = imageIndex;

    if (newImage && wipeFrameDuration > 0)
    {
        displayDriver->startWipe(wipeFrameDuration);
    }

    file.seek(headerSize + imageIndex * sizeof(uint32_t));
    uint32_t offset = readInt();
    file.seek(offset);
    uint8_t displayType = readByte();
    uint32_t frameCount;
    uint32_t frameDuration;

    switch (displayType)
    {
    case 1: // Generic animated
    {
        frameCount = readInt();
        updateFrameIndex(newImage, frameCount);

        file.seek(offset + sizeof(displayType) + sizeof(frameCount) + frameIndex * sizeof(offset));
        offset = readInt();
        file.seek(offset);

        frameDuration = readInt();
        decodePackBits(width, 0);
        break;
    }
    case 2: // Standard scroll
    {
        uint32_t sameColumnCount = readInt();
        uint32_t animatedColumnCount = readInt();
        frameCount = animatedColumnCount + width - sameColumnCount;
        updateFrameIndex(newImage, frameCount);

        frameDuration = 30000;
        decodePackBits(sameColumnCount, animatedColumnCount);
        break;
    }
    default: // Generic image
    {
        frameCount = 1;
        updateFrameIndex(newImage, frameCount);

        frameDuration = imageDuration;
        decodePackBits(width, 0);
        break;
    }
    }

    frameIndex++;
    displayDriver->push();
    displayDriver->setTargetFrameDuration(frameDuration);
    return frameIndex == frameCount;
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

void FileLoader::updateFrameIndex(bool newImage, uint32_t frameCount)
{
    if (newImage || frameIndex >= frameCount)
    {
        frameIndex = 0;
        displayDriver->clear();
    }
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
