#pragma once

#include "spi_device.h"
#include <SdFat.h>

class SPIMaster : public SPIDevice
{
public:
    SPIMaster(gpio_num_t pinCS);
    static bool initBus();
    bool init() override;
    bool send(FsFile &file);
    static SdFat &getSD() { return sdFat; };

private:
    static constexpr gpio_num_t PIN_CS_SD = GPIO_NUM_12;
    static constexpr uint32_t SPI_SPEED = 1000000;

    static SPIClass *spiBus;
    static SdFat sdFat;

    const gpio_num_t pinCS;
};
