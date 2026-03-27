#pragma once

#include "spi_master.h"

class DisplayTransactionMaster
{
public:
    DisplayTransactionMaster(SPIMaster *spiMaster, uint8_t displayIndex);
    static bool initSD();
    bool init();
    void nextDisplay();

private:
    static constexpr gpio_num_t PIN_CS_SD = GPIO_NUM_12;
    static constexpr uint8_t FUNCTION_SCREEN_OFF = 0;
    static constexpr uint8_t FUNCTION_SCREEN_ON = 1;
    static constexpr uint8_t FUNCTION_NEXT_DISPLAY = 2;

    SPIMaster *spiMaster;
    const uint8_t displayIndex;
    uint8_t currentGroup = 0;
};
