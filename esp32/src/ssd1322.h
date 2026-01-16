#ifndef SSD1322_H
#define SSD1322_H

#include <U8g2lib.h>

#define SSD1322_SCREEN_WIDTH 256
#define SSD1322_SCREEN_HEIGHT 64

class SSD1322
{
public:
    void init();
    void setTargetFramesPerSecond(uint16_t targetFramesPerSecond);
    void drawPixel(uint16_t x, uint16_t y, uint8_t brightness);
    void push();

private:
    uint16_t targetFramesPerSecond;
    unsigned long lastFrameMillis;
    uint8_t buffer[SSD1322_SCREEN_WIDTH * SSD1322_SCREEN_HEIGHT / 2];

    static void send(uint8_t value, bool isData);
};

#endif
