#include "display.h"
#include <LittleFS.h>

Display::Display(U8X8 u8x8, const uint16_t width, const uint16_t height) : u8x8(u8x8), width(width), height(height) {}

/**
 * Read a file from LittleFS and store it in memory.
 * @param path the LittleFS path to read from
 */
void Display::loadImage(const char *path)
{
    File file = LittleFS.open(path, "r");
    if (file)
    {
        uint16_t i = 0;
        while (file.available() && i < MAX_IMAGE_WIDTH * MAX_DISPLAY_HEIGHT / 8)
        {
            imageBuffer[i] = char2int(file.read());
            i++;
        }
    }
    file.close();

    animationProgress = 0;

    // TODO
    scrollImageWidth = 256;
    scrollLeftAnchor = 0;
    scrollRightAnchor = 0;
}

/**
 * Directly render the image stored in memory without any animation.
 */
void Display::showImage()
{
    // Copy the buffer without animation
    for (uint16_t column = 0; column < width; column++)
        for (uint16_t row = 0; row < height / 8; row++)
            displayBuffer[column + row * MAX_DISPLAY_WIDTH] = imageBuffer[column + row * MAX_DISPLAY_WIDTH];

    // Render each row
    for (uint16_t row = 0; row < height / 8; row++)
        u8x8.drawTile(0, row, width / 8, displayBuffer + MAX_DISPLAY_WIDTH * row);
}

/**
 * Render the image stored in memory with a wipe animation, similar to flip-dot displays. This must be called every tick.
 */
void Display::wipeImage()
{
    if (animationProgress < width)
    {
        const uint16_t activeColumn = animationProgress / 8;

        // Copy the buffer
        for (uint16_t column = 0; column < 8; column++)
            for (uint16_t row = 0; row < height / 8; row++)
                if (column <= animationProgress % 8)
                    displayBuffer[activeColumn * 8 + column + row * MAX_DISPLAY_WIDTH] = imageBuffer[activeColumn * 8 + column + row * MAX_DISPLAY_WIDTH];

        // Render each row, only at the active column
        for (uint16_t row = 0; row < height / 8; row++)
            u8x8.drawTile(activeColumn, row, 1, displayBuffer + activeColumn * 8 + row * MAX_DISPLAY_WIDTH);

        animationProgress++;
    }
}

void Display::scrollImage()
{
    if (animationProgress == 0)
    {
        // Copy the static parts of the buffer
        for (uint16_t column = 0; column < width; column++)
            for (uint16_t row = 0; row < height / 8; row++)
                if (column < scrollLeftAnchor)
                    displayBuffer[column + row * MAX_DISPLAY_WIDTH] = imageBuffer[column + row * MAX_DISPLAY_WIDTH];
                else if (column >= width - scrollRightAnchor)
                    displayBuffer[column + row * MAX_DISPLAY_WIDTH] = imageBuffer[column + scrollImageWidth - width + row * MAX_DISPLAY_WIDTH];
                else
                    displayBuffer[column + row * MAX_DISPLAY_WIDTH] = 0;

        // Render each row
        for (uint16_t row = 0; row < height / 8; row++)
            u8x8.drawTile(0, row, width / 8, displayBuffer + MAX_DISPLAY_WIDTH * row);
    }
    else if (scrollLeftAnchor + scrollRightAnchor < width)
    {
        const uint16_t scrollDisplayWidth = width - scrollLeftAnchor - scrollRightAnchor;
        const uint16_t actualScrollImageWidth = scrollImageWidth - scrollLeftAnchor - scrollRightAnchor;
        const uint16_t leftActiveColumn = scrollLeftAnchor / 8;
        const uint16_t rightActiveColumn = (width - scrollRightAnchor + 7) / 8;
        const uint16_t actualAnimationProgress = animationProgress % (scrollDisplayWidth + actualScrollImageWidth);

        // Copy the buffer
        for (uint16_t column = 0; column < scrollDisplayWidth; column++)
            for (uint16_t row = 0; row < height / 8; row++)
                if (column + actualAnimationProgress < scrollDisplayWidth || column + actualAnimationProgress >= scrollDisplayWidth + actualScrollImageWidth)
                    displayBuffer[column + scrollLeftAnchor + row * MAX_DISPLAY_WIDTH] = 0;
                else
                    displayBuffer[column + scrollLeftAnchor + row * MAX_DISPLAY_WIDTH] = imageBuffer[column + scrollLeftAnchor + actualAnimationProgress - scrollDisplayWidth + row * MAX_DISPLAY_WIDTH];

        // Render each row
        for (uint16_t row = 0; row < height / 8; row++)
            u8x8.drawTile(leftActiveColumn, row, rightActiveColumn - leftActiveColumn + 1, displayBuffer + leftActiveColumn * 8 + MAX_DISPLAY_WIDTH * row);
    }

    animationProgress++;
}

void Display::begin()
{
    u8x8.begin();
    clear();
}

void Display::clear()
{
    u8x8.clear();
}

uint8_t Display::char2int(char input)
{
    if (input >= '0' && input <= '9')
        return input - '0';
    else if (input >= 'A' && input <= 'F')
        return input - 'A' + 10;
    else if (input >= 'a' && input <= 'f')
        return input - 'a' + 10;
    else
        return 0;
}
