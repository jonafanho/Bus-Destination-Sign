#include "spi_master.h"

bool SPIMaster::initBus()
{
    spi_bus_config_t busConfig = {
        .mosi_io_num = PIN_MOSI,
        .miso_io_num = PIN_MISO,
        .sclk_io_num = PIN_CLK,
        .quadwp_io_num = -1,
        .quadhd_io_num = -1,
        .max_transfer_sz = CHUNK_SIZE,
    };

    return spi_bus_initialize(SPI2_HOST, &busConfig, SPI_DMA_CH_AUTO) == ESP_OK;
}

bool SPIMaster::init()
{
    spi_device_interface_config_t deviceConfig = {
        .mode = 0,
        .clock_speed_hz = 1000000,
        .spics_io_num = PIN_CS,
        .queue_size = 3,
    };

    return spi_bus_add_device(SPI2_HOST, &deviceConfig, &spi) == ESP_OK;
}

bool SPIMaster::send(const std::vector<uint8_t> data, uint32_t length)
{
    uint32_t headerPayload[] = {MAGIC_HEADER, length};
    spi_transaction_t headerTransaction = {
        .flags = 0,
        .length = TOTAL_HEADER_LENGTH,
        .tx_buffer = headerPayload,
        .rx_buffer = NULL,
    };

    if (spi_device_transmit(spi, &headerTransaction) != ESP_OK)
    {
        return false;
    }

    uint32_t sentLength = 0;
    while (sentLength < length)
    {
        uint32_t chunkLength = min(CHUNK_SIZE, length - sentLength);

        spi_transaction_t bodyTransaction = {
            .length = chunkLength * 8,
            .tx_buffer = data.data() + sentLength,
            .rx_buffer = NULL,
        };

        if (spi_device_transmit(spi, &bodyTransaction) != ESP_OK)
        {
            return false;
        }

        sentLength += chunkLength;
    }

    return true;
}
