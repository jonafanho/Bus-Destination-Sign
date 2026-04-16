#pragma once

#include "spi_slave.h"
#include "stream_reader.h"

class DisplayTransactionSlave
{
public:
    void tick(SPISlave *spiSlave, StreamReader *defaultStreamReaders, DisplayDriver *displayDriver);

private:
    StreamReader customStreamReader;
    BufferStreamWrapper customBufferStreamWrapper;

    uint8_t imageIndex = 0;
    int32_t imageDuration = 0;
    int32_t imageScroll = 0;
    uint8_t imagesInGroup = 0;
};
