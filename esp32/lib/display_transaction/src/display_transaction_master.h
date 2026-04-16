#pragma once

#include "spi_master.h"

class DisplayTransactionMaster
{
public:
    DisplayTransactionMaster(uint8_t displayIndex);
    static bool initSD();
    bool init();
    void nextDisplay(SPIMaster *spiMaster);

private:
    static constexpr gpio_num_t PIN_CS_SD = GPIO_NUM_12;

    const uint8_t displayIndex;
    uint8_t currentGroup = 0;
};
