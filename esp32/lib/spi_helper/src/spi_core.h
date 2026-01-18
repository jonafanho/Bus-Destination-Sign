#ifndef SPI_CORE_H
#define SPI_CORE_H

#include <Arduino.h>

class SPICore
{
protected:
    static constexpr uint32_t MAGIC_HEADER = 0x20220326;
    static constexpr uint32_t TOTAL_HEADER_LENGTH = 32 + 32; // Includes the magic header plus the length of the whole payload
    static constexpr uint32_t CHUNK_SIZE = 512;

    virtual bool init() = 0;
};

#endif
