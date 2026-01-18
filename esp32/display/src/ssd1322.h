#ifndef SSD1322_H
#define SSD1322_H

#include <U8g2lib.h>

class SSD1322
{
public:
    static constexpr uint16_t SCREEN_WIDTH = 256;
    static constexpr uint16_t SCREEN_HEIGHT = 64;

    void init();
    void setTargetFramesPerSecond(uint16_t targetFramesPerSecond);
    void drawPixel(uint16_t x, uint16_t y, uint8_t brightness);
    void push();

private:
    static constexpr uint8_t PIN_SCREEN_ENABLE = 13;

    static constexpr uint8_t PIN_D0 = 1;
    static constexpr uint8_t PIN_D1 = 2;
    static constexpr uint8_t PIN_D2 = 3;
    static constexpr uint8_t PIN_D3 = 4;
    static constexpr uint8_t PIN_D4 = 5;
    static constexpr uint8_t PIN_D5 = 6;
    static constexpr uint8_t PIN_D6 = 7;
    static constexpr uint8_t PIN_D7 = 8;

    static constexpr uint8_t PIN_WR = 9;
    static constexpr uint8_t PIN_DC = 10;
    static constexpr uint8_t PIN_CS = 11;
    static constexpr uint8_t PIN_RST = 14;

    uint16_t targetFramesPerSecond;
    unsigned long lastFrameMillis;
    uint8_t buffer[SCREEN_WIDTH * SCREEN_HEIGHT / 2];

    static void send(uint8_t value, bool isData);
};

#endif
