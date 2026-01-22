#ifndef SPI_MASTER_H
#define SPI_MASTER_H

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
    static constexpr gpio_num_t PIN_CLK = GPIO_NUM_12;
    static constexpr gpio_num_t PIN_MOSI = GPIO_NUM_11;
    static constexpr gpio_num_t PIN_MISO = GPIO_NUM_13;
    static constexpr gpio_num_t PIN_CS = GPIO_NUM_19;

    spi_device_handle_t spi;
};

#endif
