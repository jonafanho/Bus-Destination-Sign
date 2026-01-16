#include "ssd1322.h"

#define PIN_SCREEN_ENABLE 13

#define PIN_D0 1
#define PIN_D1 2
#define PIN_D2 3
#define PIN_D3 4
#define PIN_D4 5
#define PIN_D5 6
#define PIN_D6 7
#define PIN_D7 8

#define PIN_WR 9
#define PIN_DC 10
#define PIN_CS 11
#define PIN_RST 14

void SSD1322::init()
{
    pinMode(PIN_SCREEN_ENABLE, OUTPUT);
    digitalWrite(PIN_SCREEN_ENABLE, HIGH);
    delay(100);
    U8G2_SSD1322_NHD_256X64_F_8080(U8G2_R0, PIN_D0, PIN_D1, PIN_D2, PIN_D3, PIN_D4, PIN_D5, PIN_D6, PIN_D7, PIN_WR, PIN_CS, PIN_DC, PIN_RST).begin();
}

void SSD1322::setTargetFramesPerSecond(uint16_t targetFramesPerSecond)
{
    this->targetFramesPerSecond = targetFramesPerSecond;
}

void SSD1322::drawPixel(uint16_t x, uint16_t y, uint8_t brightness)
{
    if (x >= SSD1322_SCREEN_WIDTH || y >= SSD1322_SCREEN_HEIGHT)
    {
        return;
    }

    uint16_t index = x / 2 + y * SSD1322_SCREEN_WIDTH / 2;

    if (x % 2 == 0)
    {
        buffer[index] = ((brightness & 0x0F) << 4) | (buffer[index] & 0x0F);
    }
    else
    {
        buffer[index] = (buffer[index] & 0xF0) | (brightness & 0x0F);
    }
}

void SSD1322::push()
{
    if (targetFramesPerSecond > 0)
    {
        while ((millis() - lastFrameMillis) * targetFramesPerSecond < 1000)
        {
            yield();
        }
        lastFrameMillis = millis();
    }

    // Column address
    send(0x15, false);
    send(28, true);
    send(28 + SSD1322_SCREEN_WIDTH / 4 - 1, true);

    // Row address
    send(0x75, false);
    send(0, true);
    send(SSD1322_SCREEN_HEIGHT - 1, true);

    // Write data into RAM
    send(0x5C, false);

    for (int i = 0; i < SSD1322_SCREEN_WIDTH * SSD1322_SCREEN_HEIGHT / 2; i++)
    {
        send(buffer[i], true);
    }
}

void SSD1322::send(uint8_t value, bool isData)
{
    GPIO.out_w1tc = (1 << PIN_D0) |
                    (1 << PIN_D1) |
                    (1 << PIN_D2) |
                    (1 << PIN_D3) |
                    (1 << PIN_D4) |
                    (1 << PIN_D5) |
                    (1 << PIN_D6) |
                    (1 << PIN_D7) |
                    (1 << PIN_CS) |
                    (isData ? 0 : 1 << PIN_DC);
    GPIO.out_w1ts = (value & 0x01 ? 1 << PIN_D0 : 0) |
                    (value & 0x02 ? 1 << PIN_D1 : 0) |
                    (value & 0x04 ? 1 << PIN_D2 : 0) |
                    (value & 0x08 ? 1 << PIN_D3 : 0) |
                    (value & 0x10 ? 1 << PIN_D4 : 0) |
                    (value & 0x20 ? 1 << PIN_D5 : 0) |
                    (value & 0x40 ? 1 << PIN_D6 : 0) |
                    (value & 0x80 ? 1 << PIN_D7 : 0) |
                    (isData ? 1 << PIN_DC : 0);
    GPIO.out_w1tc = (1 << PIN_WR);
    asm volatile("nop\n");
    GPIO.out_w1ts = (1 << PIN_WR) | (1 << PIN_CS);
}
