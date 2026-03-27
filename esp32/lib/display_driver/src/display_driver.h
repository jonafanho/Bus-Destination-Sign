#pragma once

#include <Arduino.h>
#include <vector>

class DisplayDriver
{
public:
    const uint16_t screenWidth;
    const uint16_t screenHeight;

    DisplayDriver(const uint16_t screenWidth, const uint16_t screenHeight, const gpio_num_t pinScreenEnable);
    bool init();
    void drawPixel(uint16_t x, uint16_t y, uint8_t brightness);
    void push();
    void setTargetFramesPerSecond(uint16_t targetFramesPerSecond);

protected:
    std::vector<uint8_t> buffer;

    virtual bool initRaw() = 0;
    virtual void pushRaw() = 0;

private:
    const gpio_num_t pinScreenEnable;
    uint16_t targetFramesPerSecond = 0;
    int64_t lastFrameMicros = 0;
};
