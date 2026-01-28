#include "spi_slave.h"
#include "driver/spi_slave.h"

bool SPISlave::init()
{
    rxDmaBuffer = (uint8_t *)heap_caps_calloc(CHUNK_SIZE, sizeof(uint8_t), MALLOC_CAP_DMA);
    txDmaBuffer = (uint8_t *)heap_caps_calloc(CHUNK_SIZE, sizeof(uint8_t), MALLOC_CAP_DMA);

    spi_bus_config_t busConfig = {
        .mosi_io_num = PIN_MOSI,
        .miso_io_num = PIN_MISO,
        .sclk_io_num = PIN_CLK,
        .quadwp_io_num = -1,
        .quadhd_io_num = -1,
        .max_transfer_sz = CHUNK_SIZE,
    };

    spi_slave_interface_config_t slaveConfig = {
        .spics_io_num = PIN_CS_DISPLAY,
        .flags = 0,
        .queue_size = 3,
        .mode = 0,
    };

    messageQueue = xQueueCreate(3, sizeof(uint8_t *));
    return spi_slave_initialize(SPI2_HOST, &busConfig, &slaveConfig, SPI_DMA_CH_AUTO) == ESP_OK;
}

void SPISlave::tick()
{
    // Setup header transaction
    spi_slave_transaction_t headerTransaction = {
        .length = TOTAL_HEADER_LENGTH,
        .tx_buffer = txDmaBuffer,
        .rx_buffer = rxDmaBuffer,
    };

    // Receive header
    if (spi_slave_transmit(SPI2_HOST, &headerTransaction, portMAX_DELAY) != ESP_OK)
    {
        return;
    }

    uint32_t magicHeader = ((uint32_t *)rxDmaBuffer)[0];
    uint32_t totalLength = ((uint32_t *)rxDmaBuffer)[1];

    // Verify header
    if (magicHeader != MAGIC_HEADER || totalLength == 0)
    {
        return;
    }

    // Allocate a buffer to hold the entire body
    uint8_t *payload = (uint8_t *)malloc(totalLength);
    uint32_t receivedLength = 0;

    // Verify payload allocation
    if (!payload)
    {
        return;
    }

    // Receive body in chunks
    while (receivedLength < totalLength)
    {
        // Setup body chunk transaction
        uint32_t chunkLength = min(CHUNK_SIZE, totalLength - receivedLength);
        spi_slave_transaction_t bodyTransaction = {
            .length = chunkLength * 8,
            .tx_buffer = txDmaBuffer,
            .rx_buffer = rxDmaBuffer,
        };

        // Receive body chunk
        if (spi_slave_transmit(SPI2_HOST, &bodyTransaction, portMAX_DELAY) != ESP_OK)
        {
            break;
        }

        // Copy body chunk to payload buffer
        memcpy(payload + receivedLength, rxDmaBuffer, chunkLength);
        receivedLength += chunkLength;
    }

    // Verify if packet is complete
    if (receivedLength != totalLength || totalLength == 0)
    {
        free(payload);
        return;
    }

    // Send message to queue
    if (xQueueSend(messageQueue, &payload, 0) != pdPASS)
    {
        free(payload);
    }
}
