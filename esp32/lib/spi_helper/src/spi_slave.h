#ifndef SPI_SLAVE_H
#define SPI_SLAVE_H

#include "spi_core.h"

class SPISlave : public SPICore
{
public:
    QueueHandle_t messageQueue;

    bool init() override;
    void tick();

    typedef struct
    {
        uint8_t *buffer;
        uint32_t length;
    } SPIMessage;

private:
    static constexpr uint8_t PIN_CLK = 17;
    static constexpr uint8_t PIN_MOSI = 18;
    static constexpr uint8_t PIN_MISO = 38;
    static constexpr uint8_t PIN_CS = 39;

    uint8_t *rxDmaBuffer = nullptr;
    uint8_t *txDmaBuffer = nullptr;
};

#endif
