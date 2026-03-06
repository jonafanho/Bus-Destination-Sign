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
    uint8_t *rxDmaBuffer = nullptr;
    uint8_t *txDmaBuffer = nullptr;
};

#endif
