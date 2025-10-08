#ifndef DISPLAY_H
#define DISPLAY_H

#define MAX_DISPLAY_WIDTH 256
#define MAX_DISPLAY_HEIGHT 64
#define MAX_IMAGE_WIDTH 512

#include <U8x8lib.h>

class Display
{
public:
    Display(U8X8 u8x8, const uint16_t width, const uint16_t height);
    void loadImage(const char *path);
    void showImage();
    void wipeImage();
    void scrollImage();
    void begin();
    void clear();

private:
    U8X8 u8x8;
    const uint16_t width;
    const uint16_t height;
    U8X8_PROGMEM uint8_t imageBuffer[MAX_IMAGE_WIDTH * MAX_DISPLAY_HEIGHT / 8];
    U8X8_PROGMEM uint8_t displayBuffer[MAX_DISPLAY_WIDTH * MAX_DISPLAY_HEIGHT / 8];
    uint16_t animationProgress;
    uint16_t scrollImageWidth;
    uint16_t scrollLeftAnchor;
    uint16_t scrollRightAnchor;
    static uint8_t char2int(char input);
};

#endif
