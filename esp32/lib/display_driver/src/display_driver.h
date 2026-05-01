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
    void clear();
    void startWipe(uint32_t wipeFrameDuration);
    void drawPixel(uint16_t x, uint16_t y, uint8_t brightness, bool replace = true);
    void push();
    void setTargetFrameDuration(uint32_t targetFrameDuration);

protected:
    std::vector<uint8_t> buffer;

    virtual bool initRaw() = 0;
    virtual void pushRaw() = 0;

private:
    const gpio_num_t pinScreenEnable;
    std::vector<uint8_t> wipeBuffer;
    uint32_t targetFrameDuration = 0;
    uint32_t wipeFrameDuration = 0;
    int64_t lastFrameMicros = 0;
};
