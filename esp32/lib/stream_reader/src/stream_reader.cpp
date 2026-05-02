#include "stream_reader.h"

void StreamReader::init(StreamWrapper *streamWrapper)
{
    this->streamWrapper = streamWrapper;
    width = streamWrapper->readInt();
    height = streamWrapper->readInt();
    imageCount = streamWrapper->readInt();
    headerSize = sizeof(width) + sizeof(height) + sizeof(imageCount);

    if (width == 128 && height == 32)
    {
        scaleX = 1.5F;
        scaleY = 1.5F;
    }
    else if (width == 160 && height == 24)
    {
        scaleX = 1.6F;
        scaleY = 1.6F;
    }
    else if (width == 28 && height == 14)
    {
        scaleX = 4.5F;
        scaleY = 4.5F;
    }
    else if (width == 36 && height == 17)
    {
        float ratio = 17.0F / 14.0F;
        scaleX = 3.5F;
        scaleY = 3.5F * ratio;
    }
    else
    {
        scaleX = 1.0F;
        scaleY = 1.0F;
    }
}

bool StreamReader::draw(DisplayDriver *displayDriver, const uint32_t imageIndex)
{
    bool newImage = imageIndex != lastImageIndex;
    lastImageIndex = imageIndex;

    if (newImage)
    {
        displayDriver->startWipe();
    }
    else
    {
        displayDriver->clear();
    }

    streamWrapper->seek(headerSize + imageIndex * sizeof(uint32_t));
    uint32_t offset = streamWrapper->readInt();
    streamWrapper->seek(offset);
    uint8_t displayType = streamWrapper->readByte();
    uint32_t frameCount;
    uint32_t frameDuration;

    uint32_t offsetX = floor((displayDriver->screenWidth - width * scaleX) / 2 / scaleX);
    uint32_t offsetY = floor((displayDriver->screenHeight - height * scaleY) / 2 / scaleY);

    switch (displayType)
    {
    case 1: // Generic animated
    {
        frameCount = streamWrapper->readInt();
        updateFrameIndex(displayDriver, offsetX, offsetY, newImage, frameCount);

        streamWrapper->seek(offset + sizeof(displayType) + sizeof(frameCount) + frameIndex * sizeof(offset));
        offset = streamWrapper->readInt();
        streamWrapper->seek(offset);

        frameDuration = streamWrapper->readInt();
        decodePackBits(displayDriver, offsetX, offsetY, width, 0);
        break;
    }
    case 2: // Standard scroll
    {
        uint32_t sameColumnCount = streamWrapper->readInt();
        uint32_t animatedColumnCount = streamWrapper->readInt();
        frameCount = animatedColumnCount + width - sameColumnCount + 1;
        updateFrameIndex(displayDriver, offsetX, offsetY, newImage, frameCount);

        frameDuration = 30000;
        decodePackBits(displayDriver, offsetX, offsetY, sameColumnCount, animatedColumnCount);
        break;
    }
    default: // Generic image
    {
        frameCount = 1;
        updateFrameIndex(displayDriver, offsetX, offsetY, newImage, frameCount);

        frameDuration = 1;
        decodePackBits(displayDriver, offsetX, offsetY, width, 0);
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

void StreamReader::updateFrameIndex(DisplayDriver *displayDriver, uint32_t offsetX, uint32_t offsetY, bool newImage, uint32_t frameCount)
{
    if (newImage || frameIndex >= frameCount)
    {
        frameIndex = 0;
    }
}

void StreamReader::decodePackBits(DisplayDriver *displayDriver, uint32_t offsetX, uint32_t offsetY, uint32_t sameColumnCount, uint32_t animatedColumnCount)
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
                drawByte(displayDriver, offsetX, offsetY, decodedIndex++, streamWrapper->readByte(), sameColumnCount, animatedColumnCount);
            }
        }
        else if (header > -128)
        {
            // Repeated bytes
            uint8_t value = streamWrapper->readByte();
            for (int i = 0; i < 1 - header; i++)
            {
                drawByte(displayDriver, offsetX, offsetY, decodedIndex++, value, sameColumnCount, animatedColumnCount);
            }
        }
    }
}

void StreamReader::drawByte(DisplayDriver *displayDriver, uint32_t offsetX, uint32_t offsetY, uint16_t decodedIndex, uint8_t byte, uint32_t sameColumnCount, uint32_t animatedColumnCount)
{
    uint32_t base = decodedIndex * 8;
    uint32_t rawWidth = sameColumnCount + animatedColumnCount;

    for (uint8_t i = 0; i < 8; i++)
    {
        uint32_t x = (base + i) % rawWidth;
        uint32_t y = (base + i) / rawWidth;

        if (x >= sameColumnCount)
        {
            x += width - sameColumnCount - frameIndex;
            if (x < sameColumnCount || x >= width)
            {
                continue;
            }
        }

        if ((byte >> i) & 1 > 0)
        {
            displayDriver->drawScaledPixel(offsetX + x, offsetY + y, scaleX, scaleY);
        }
    }
}
