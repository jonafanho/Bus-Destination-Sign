#pragma once

#include "spi_device.h"
#include "driver/spi_master.h"
#include <vector>

class SPIMaster : public SPIDevice
{
public:
    static bool initBus();
    bool init() override;
    bool send(const std::vector<uint8_t> data, uint32_t length);

private:
    spi_device_handle_t spi;
};
