#include "display.h"
#include <LittleFS.h>

Display::Display(U8X8 u8x8, Settings settings, const uint16_t width, const uint16_t height, const uint8_t displayIndex) : u8x8(u8x8), settings(settings), width(width), height(height), displayIndex(displayIndex) {}

void Display::begin()
{
    u8x8.begin();
    clear();
}

void Display::clear()
{
    u8x8.clear();
}

void Display::tick()
{
    if (millis() >= displaySwitchMillis)
    {
        loadImage();
    }
    else if (nextTransitionMillis == displaySwitchMillis)
    {
        if (scrollImageWidth > 0)
        {
            scrollImage();
        }
    }
    else
    {
        if (wipeSpeed > 0)
        {
            wipeImage();
        }
        else
        {
            showImage();
        }
    }
}

/**
 * Read a file from LittleFS and store it in memory.
 */
void Display::loadImage()
{
    JsonDocument jsonDocument;
    deserializeJson(jsonDocument, settings.getSettings());
    JsonArray displayImages = jsonDocument[displayIndex]["displayImages"];

    if (currentIndex >= displayImages.size())
    {
        currentIndex = 0;
    }

    char fileName[32];
    sprintf(fileName, "/displays/%d_%d", displayIndex, currentIndex);
    File file = LittleFS.open(fileName, "r");
    if (file)
    {
        uint16_t i = 0;
        while (file.available() && i < MAX_IMAGE_WIDTH * MAX_DISPLAY_HEIGHT / 8)
        {
            imageBuffer[i] = (uint8_t)file.read();
            i++;
        }
    }
    file.close();

    JsonObject displayImage = displayImages[currentIndex];
    displaySwitchMillis = millis() + displayImage["displayDuration"];
    nextTransitionMillis = 0;
    wipeSpeed = displayImage["wipeSpeed"];
    scrollImageWidth = displayImage["width"];
    scrollLeftAnchor = displayImage["scrollLeftAnchor"];
    scrollRightAnchor = displayImage["scrollRightAnchor"];

    currentIndex++;
    animationProgress = 0;
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

    nextTransitionMillis = displaySwitchMillis;
}

/**
 * Render the image stored in memory with a wipe animation, similar to flip-dot displays. This must be called every tick.
 */
void Display::wipeImage()
{
    unsigned long startMillis = millis();
    if (startMillis >= nextTransitionMillis)
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
            nextTransitionMillis = startMillis + wipeSpeed;
        }
        else
        {
            animationProgress = 0;
            nextTransitionMillis = displaySwitchMillis;
        }
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
