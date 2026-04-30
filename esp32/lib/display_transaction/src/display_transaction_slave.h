#pragma once

#include "spi_slave.h"
#include "stream_reader.h"

class DisplayTransactionSlave
{
public:
    void tick(SPISlave *spiSlave, StreamReader *streamReader, DisplayDriver *displayDriver);

private:
    BufferStreamWrapper bufferStreamWrapper;
    uint8_t imageIndex = 0;
};
