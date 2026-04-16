#include "display_transaction_slave.h"

void DisplayTransactionSlave::tick(SPISlave *spiSlave, StreamReader *defaultStreamReaders, DisplayDriver *displayDriver)
{
    uint8_t *buffer = nullptr;
    if (xQueueReceive(spiSlave->messageQueue, &buffer, 0))
    {
        customBufferStreamWrapper.init(buffer);
        imageDuration = customBufferStreamWrapper.readInt();
        imageScroll = customBufferStreamWrapper.readInt();
        imagesInGroup = customBufferStreamWrapper.readByte();
        imageIndex = 0;
    }

    // defaultStreamReaders[0].init(&customBufferStreamWrapper);
    // defaultStreamReaders[0].draw(displayDriver, imageIndex, imageDuration);
}
