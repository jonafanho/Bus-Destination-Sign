#ifndef DISPLAY_H
#define DISPLAY_H

#define MAX_DISPLAY_WIDTH 256
#define MAX_DISPLAY_HEIGHT 64
#define MAX_IMAGE_WIDTH 512

#include "settings.h"
#include <U8x8lib.h>

class Display
{
public:
    Display(U8X8 u8x8, Settings settings, const uint16_t width, const uint16_t height, const uint8_t displayIndex);
    void begin();
    void clear();
    void tick();
    void changeGroup();

private:
    U8X8 u8x8;
    Settings settings;

    const uint16_t width;
    const uint16_t height;
    const uint8_t displayIndex;

    U8X8_PROGMEM uint8_t imageBuffer[MAX_IMAGE_WIDTH * MAX_DISPLAY_HEIGHT / 8];
    U8X8_PROGMEM uint8_t displayBuffer[MAX_DISPLAY_WIDTH * MAX_DISPLAY_HEIGHT / 8];

    /**
     * The current image index in the group
     */
    uint8_t currentIndex;
    /**
     * The current group
     */
    uint8_t group;
    /**
     * The current progress of the transition or animation
     */
    uint16_t animationProgress;
    /**
     * The timestamp to switch to the next display
     */
    unsigned long displaySwitchMillis;
    /**
     * The timestamp to tick the next transition frame (not animation)
     */
    unsigned long nextTransitionMillis;

    uint16_t wipeSpeed;
    uint16_t scrollImageWidth;
    uint16_t scrollLeftAnchor;
    uint16_t scrollRightAnchor;

    void loadImage();
    void showImage();
    void wipeImage();
    void scrollImage();

    static uint8_t char2int(char input);
};

#endif
