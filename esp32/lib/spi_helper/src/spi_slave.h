#ifndef SPI_SLAVE_H
#define SPI_SLAVE_H

#include "spi_device.h"

class SPISlave : public SPIDevice
{
public:
    QueueHandle_t messageQueue;

    bool init() override;
    void tick();

private:
    static constexpr gpio_num_t PIN_CLK = GPIO_NUM_17;
    static constexpr gpio_num_t PIN_MOSI = GPIO_NUM_18;
    static constexpr gpio_num_t PIN_MISO = GPIO_NUM_38;
    static constexpr gpio_num_t PIN_CS = GPIO_NUM_39;

    uint8_t *rxDmaBuffer = nullptr;
    uint8_t *txDmaBuffer = nullptr;
};

#endif
