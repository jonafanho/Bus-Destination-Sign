#include "spi_master.h"
#include <vector>

SPIMaster::SPIMaster(gpio_num_t pinCS) : pinCS(pinCS) {}

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
        .spics_io_num = pinCS,
        .queue_size = 3,
    };

    return spi_bus_add_device(SPI2_HOST, &deviceConfig, &spi) == ESP_OK;
}

bool SPIMaster::send(FILE *file)
{
    fseek(file, 0, SEEK_END);
    uint32_t length = ftell(file);
    fseek(file, 0, SEEK_SET);
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
        std::vector<uint8_t> buffer(chunkLength);
        fread(buffer.data(), 1, chunkLength, file);

        spi_transaction_t bodyTransaction = {
            .length = chunkLength * 8,
            .tx_buffer = buffer.data(),
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
