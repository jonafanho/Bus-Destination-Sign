#ifndef SPI_MASTER_H
#define SPI_MASTER_H

#include "spi_core.h"
#include "driver/spi_master.h"

class SPIMaster : public SPICore
{
public:
    bool init() override;
    bool send(const uint8_t *data, uint32_t length);

private:
    static constexpr uint8_t PIN_CLK = 14;
    static constexpr uint8_t PIN_MOSI = 13;
    static constexpr uint8_t PIN_MISO = 12;
    static constexpr uint8_t PIN_CS = 15;

    spi_device_handle_t spi;
};

#endif
