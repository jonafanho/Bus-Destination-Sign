#ifndef DISPLAY_TRANSACTION_SLAVE_H
#define DISPLAY_TRANSACTION_SLAVE_H

#include "spi_slave.h"
#include "display_driver.h"
#include <array>

class DisplayTransactionSlave
{
public:
    DisplayTransactionSlave(SPISlave *spiSlave, DisplayDriver *displayDriver);
    void displayTick();

private:
    static constexpr uint8_t MAX_DISPLAYS_IN_GROUP = 16;
    static constexpr uint16_t MAX_IMAGE_BUFFER_SIZE = 8192;
    static constexpr uint8_t FUNCTION_SCREEN_OFF = 0;
    static constexpr uint8_t FUNCTION_SCREEN_ON = 1;
    static constexpr uint8_t FUNCTION_NEXT_DISPLAY = 2;

    SPISlave *spiSlave;
    DisplayDriver *displayDriver;

    int64_t offsetMicros = 0;
    uint8_t imagesInGroup = 0;
    uint16_t totalImageDuration = 0;
    std::array<uint16_t, MAX_DISPLAYS_IN_GROUP> displayDurationList;
    std::array<uint16_t, MAX_DISPLAYS_IN_GROUP> wipeSpeedList;
    std::array<uint16_t, MAX_DISPLAYS_IN_GROUP> widthList;
    std::array<uint16_t, MAX_DISPLAYS_IN_GROUP> scrollLeftAnchorList;
    std::array<uint16_t, MAX_DISPLAYS_IN_GROUP> scrollRightAnchorList;
    std::array<uint16_t, MAX_DISPLAYS_IN_GROUP> imageBytesLengthList;
    std::array<std::array<uint8_t, MAX_IMAGE_BUFFER_SIZE>, MAX_DISPLAYS_IN_GROUP> imageBufferList;

    void processNextDisplay(const uint8_t *data);
    static uint16_t getValue(const uint8_t *data);
};

#endif
