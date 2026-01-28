#ifndef SPI_DEVICE_H
#define SPI_DEVICE_H

#include <Arduino.h>

class SPIDevice
{
public:
    virtual bool init() = 0;

protected:
    static constexpr uint32_t MAGIC_HEADER = 0x20220326;
    static constexpr uint32_t TOTAL_HEADER_LENGTH = 32 + 32; // Includes the magic header plus the length of the whole payload
    static constexpr uint32_t CHUNK_SIZE = 512;

    static constexpr gpio_num_t PIN_CLK = GPIO_NUM_17;
    static constexpr gpio_num_t PIN_MOSI = GPIO_NUM_18;
    static constexpr gpio_num_t PIN_MISO = GPIO_NUM_38;
    static constexpr gpio_num_t PIN_CS_DISPLAY = GPIO_NUM_39;
};

#endif
