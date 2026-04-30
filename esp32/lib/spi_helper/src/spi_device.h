#pragma once

#include <Arduino.h>
#include <array>
#include <cstdint>
#include <vector>

static constexpr uint32_t CHUNK_SIZE = 512;

struct ChunkedBuffer
{
    uint32_t totalLength;
    std::vector<std::array<uint8_t, CHUNK_SIZE> *> chunks;

    ~ChunkedBuffer()
    {
        for (std::array<uint8_t, CHUNK_SIZE> *chunk : chunks)
        {
            delete chunk;
        }
    }
};

class SPIDevice
{
public:
    virtual bool init() = 0;

protected:
    static constexpr uint32_t MAGIC_HEADER = 0x20220326;
    static constexpr uint32_t TOTAL_HEADER_LENGTH = 32 + 32; // Includes the magic header plus the length of the whole payload

    static constexpr gpio_num_t PIN_CLK = GPIO_NUM_17;
    static constexpr gpio_num_t PIN_MOSI = GPIO_NUM_18;
    static constexpr gpio_num_t PIN_MISO = GPIO_NUM_38;
    static constexpr gpio_num_t PIN_CS_DISPLAY = GPIO_NUM_39;
};
