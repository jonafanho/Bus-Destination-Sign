#include "stream_reader.h"

void StreamReader::init(StreamWrapper *streamWrapper)
{
    this->streamWrapper = streamWrapper;
    width = streamWrapper->readInt();
    height = streamWrapper->readInt();
    imageCount = streamWrapper->readInt();
    headerSize = sizeof(width) + sizeof(height) + sizeof(imageCount);
}

bool StreamReader::draw(DisplayDriver *displayDriver, const uint32_t imageIndex, const uint32_t wipeFrameDuration)
{
    bool newImage = imageIndex != lastImageIndex;
    lastImageIndex = imageIndex;

    if (newImage && wipeFrameDuration > 0)
    {
        displayDriver->startWipe(wipeFrameDuration);
    }

    streamWrapper->seek(headerSize + imageIndex * sizeof(uint32_t));
    uint32_t offset = streamWrapper->readInt();
    streamWrapper->seek(offset);
    uint8_t displayType = streamWrapper->readByte();
    uint32_t frameCount;
    uint32_t frameDuration;

    switch (displayType)
    {
    case 1: // Generic animated
    {
        frameCount = streamWrapper->readInt();
        updateFrameIndex(displayDriver, newImage, frameCount);

        streamWrapper->seek(offset + sizeof(displayType) + sizeof(frameCount) + frameIndex * sizeof(offset));
        offset = streamWrapper->readInt();
        streamWrapper->seek(offset);

        frameDuration = streamWrapper->readInt();
        decodePackBits(displayDriver, width, 0);
        break;
    }
    case 2: // Standard scroll
    {
        uint32_t sameColumnCount = streamWrapper->readInt();
        uint32_t animatedColumnCount = streamWrapper->readInt();
        frameCount = animatedColumnCount + width - sameColumnCount;
        updateFrameIndex(displayDriver, newImage, frameCount);

        frameDuration = 30000;
        decodePackBits(displayDriver, sameColumnCount, animatedColumnCount);
        break;
    }
    default: // Generic image
    {
        frameCount = 1;
        updateFrameIndex(displayDriver, newImage, frameCount);

        frameDuration = 1;
        decodePackBits(displayDriver, width, 0);
        break;
    }
    }

    frameIndex++;
    displayDriver->push();
    displayDriver->setTargetFrameDuration(frameDuration);
    return frameIndex == frameCount;
}

uint32_t StreamReader::getWidth()
{
    return width;
}

uint32_t StreamReader::getHeight()
{
    return height;
}

uint32_t StreamReader::getImageCount()
{
    return imageCount;
}

void StreamReader::updateFrameIndex(DisplayDriver *displayDriver, bool newImage, uint32_t frameCount)
{
    if (newImage || frameIndex >= frameCount)
    {
        frameIndex = 0;
        displayDriver->clear();
    }
}

void StreamReader::decodePackBits(DisplayDriver *displayDriver, uint32_t sameColumnCount, uint32_t animatedColumnCount)
{
    uint16_t decodedIndex = 0;
    while (decodedIndex < (sameColumnCount + animatedColumnCount) * height / 8)
    {
        int8_t header = streamWrapper->readByte();
        if (header >= 0)
        {
            // Literal run
            for (int i = 0; i < header + 1; i++)
            {
                drawByte(displayDriver, decodedIndex++, streamWrapper->readByte(), sameColumnCount, animatedColumnCount);
            }
        }
        else if (header > -128)
        {
            // Repeated bytes
            uint8_t value = streamWrapper->readByte();
            for (int i = 0; i < 1 - header; i++)
            {
                drawByte(displayDriver, decodedIndex++, value, sameColumnCount, animatedColumnCount);
            }
        }
    }
}

void StreamReader::drawByte(DisplayDriver *displayDriver, uint16_t decodedIndex, uint8_t byte, uint32_t sameColumnCount, uint32_t animatedColumnCount)
{
    uint32_t base = decodedIndex * 8;
    uint32_t rawWidth = sameColumnCount + animatedColumnCount;

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
