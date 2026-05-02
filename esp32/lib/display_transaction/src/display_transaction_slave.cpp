#include "display_transaction_slave.h"

void DisplayTransactionSlave::tick(SPISlave *spiSlave, StreamReader *streamReader, DisplayDriver *displayDriver)
{
    ChunkedBuffer *chunkedBuffer = nullptr;
    if (xQueueReceive(spiSlave->messageQueue, &chunkedBuffer, 0))
    {
        bufferStreamWrapper.init(chunkedBuffer);
        streamReader->init(&bufferStreamWrapper);
        imageIndex = 0;
    }

    uint32_t imageCount = streamReader->getImageCount();
    if (imageCount > 0 && streamReader->draw(displayDriver, imageIndex))
    {
        imageIndex = (imageIndex + 1) % imageCount;
    }
}
