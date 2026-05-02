#include "spi_master.h"
#include <array>

SPIClass *SPIMaster::spiBus = nullptr;
SdFat SPIMaster::sdFat;

SPIMaster::SPIMaster(gpio_num_t pinCS) : pinCS(pinCS) {}

bool SPIMaster::initBus()
{
    spiBus = new SPIClass(HSPI);
    spiBus->begin(PIN_CLK, PIN_MISO, PIN_MOSI, -1);
    SdSpiConfig config(PIN_CS_SD, SHARED_SPI, SPI_SPEED, spiBus);
    return sdFat.begin(config);
}

bool SPIMaster::init()
{
    pinMode(pinCS, OUTPUT);
    digitalWrite(pinCS, HIGH);
    return true;
}

bool SPIMaster::send(FsFile &file)
{
    uint32_t length = file.fileSize();
    file.rewind();

    // Send header
    digitalWrite(pinCS, LOW);
    spiBus->beginTransaction(SPISettings(SPI_SPEED, MSBFIRST, SPI_MODE0));
    uint32_t headerPayload[] = {MAGIC_HEADER, length};
    spiBus->transferBytes((uint8_t *)headerPayload, nullptr, TOTAL_HEADER_LENGTH / 8);
    spiBus->endTransaction();
    digitalWrite(pinCS, HIGH);

    uint32_t sentLength = 0;
    while (sentLength < length)
    {
        uint32_t chunkLength = min(CHUNK_SIZE, length - sentLength);
        std::array<uint8_t, CHUNK_SIZE> buffer;
        int bytesRead = file.read(buffer.data(), chunkLength);

        if (bytesRead < chunkLength)
        {
            // Adjust chunk length if reading less than expected
            chunkLength = bytesRead;
        }

        if (chunkLength == 0)
        {
            // No more data to read
            break;
        }

        // Send chunk
        digitalWrite(pinCS, LOW);
        spiBus->beginTransaction(SPISettings(SPI_SPEED, MSBFIRST, SPI_MODE0));
        spiBus->transferBytes(buffer.data(), nullptr, chunkLength);
        spiBus->endTransaction();
        digitalWrite(pinCS, HIGH);

        sentLength += chunkLength;
    }

    return sentLength == length;
}
