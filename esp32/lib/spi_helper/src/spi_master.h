#pragma once

#include "spi_device.h"
#include "driver/spi_master.h"
#include "sdmmc_cmd.h"

class SPIMaster : public SPIDevice
{
public:
    static bool initBus();
    bool init() override;
    bool send(FILE *file);

private:
    spi_device_handle_t spi;
};
