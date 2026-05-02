#pragma once

#include "spi_master.h"

class DisplayTransactionMaster
{
public:
    DisplayTransactionMaster(uint8_t displayIndex);
    bool init();
    void nextDisplay(SPIMaster *spiMaster);

private:
    const uint8_t displayIndex;
    uint8_t currentGroup = 0;

    static bool createDirectory(const char *path);
};
