#pragma once

#include "spi_device.h"
#include "driver/spi_master.h"
#include "sdmmc_cmd.h"

class SPIMaster : public SPIDevice
{
public:
    SPIMaster(gpio_num_t pinCS);
    static bool initBus();
    bool init() override;
    bool send(FILE *file);

private:
    const gpio_num_t pinCS;
    spi_device_handle_t spi;
};
