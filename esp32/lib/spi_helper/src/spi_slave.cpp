#include "spi_slave.h"
#include "driver/spi_slave.h"
#include <vector>
#include <esp_heap_caps.h>

SPISlave::~SPISlave()
{
    // Free DMA buffers to prevent memory leak
    if (rxDmaBuffer)
    {
        heap_caps_free(rxDmaBuffer);
        rxDmaBuffer = nullptr;
    }

    if (txDmaBuffer)
    {
        heap_caps_free(txDmaBuffer);
        txDmaBuffer = nullptr;
    }
}

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

    messageQueue = xQueueCreate(3, sizeof(ChunkedBuffer *));
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

    Serial.print("Received SPI message of length ");
    Serial.println(totalLength);
    totalLength = min(HARD_SIZE_CAP, totalLength);

    // Allocate chunked buffer container
    ChunkedBuffer *chunkedBuffer = new ChunkedBuffer();
    chunkedBuffer->totalLength = totalLength;
    uint32_t receivedLength = 0;

    // Receive body in chunks - allocate each chunk separately
    while (receivedLength < totalLength)
    {
        uint32_t chunkLength = min(CHUNK_SIZE, totalLength - receivedLength);

        // Allocate fixed-size chunk on heap
        std::array<uint8_t, CHUNK_SIZE> *chunk = new std::array<uint8_t, CHUNK_SIZE>();

        // Setup body chunk transaction
        spi_slave_transaction_t bodyTransaction = {
            .length = chunkLength * 8,
            .tx_buffer = txDmaBuffer,
            .rx_buffer = rxDmaBuffer,
        };

        // Receive body chunk
        if (spi_slave_transmit(SPI2_HOST, &bodyTransaction, portMAX_DELAY) != ESP_OK)
        {
            delete chunk;
            break;
        }

        // Copy body chunk to newly allocated chunk
        memcpy(chunk->data(), rxDmaBuffer, chunkLength);
        chunkedBuffer->chunks.push_back(chunk);
        receivedLength += chunkLength;
    }

    // Verify if packet is complete
    if (receivedLength != totalLength || totalLength == 0)
    {
        delete chunkedBuffer; // Destructor cleans up all chunks
        return;
    }

    // Send message to queue (receiver owns the pointer)
    if (xQueueSend(messageQueue, &chunkedBuffer, 0) != pdPASS)
    {
        delete chunkedBuffer;
    }
}
