#pragma once

#include "spi_device.h"
#include <memory>

class StreamWrapper
{
public:
    virtual void seek(uint32_t offset) = 0;
    virtual uint8_t readByte() = 0;
    virtual uint32_t readInt() = 0;
};

class BufferStreamWrapper : public StreamWrapper
{
public:
    void init(ChunkedBuffer *chunkedBuffer)
    {
        // Old chunkedBuffer automatically freed by unique_ptr (destructor cleans chunks)
        this->chunkedBuffer.reset(chunkedBuffer);
        this->offset = 0;
    };

    void seek(uint32_t offset) override
    {
        this->offset = offset;
    };

    uint8_t readByte() override
    {
        if (!chunkedBuffer || offset >= chunkedBuffer->totalLength)
        {
            return 0;
        }

        // Map offset to chunk and index within chunk
        uint32_t chunkIndex = offset / CHUNK_SIZE;
        uint32_t chunkOffset = offset % CHUNK_SIZE;

        if (chunkIndex >= chunkedBuffer->chunks.size())
        {
            return 0;
        }

        uint8_t value = (*chunkedBuffer->chunks[chunkIndex])[chunkOffset];
        offset++;
        return value;
    };

    uint32_t readInt() override
    {
        if (!chunkedBuffer || offset + sizeof(uint32_t) > chunkedBuffer->totalLength)
        {
            return 0;
        }

        uint32_t result = 0;
        for (uint8_t i = 0; i < sizeof(result); i++)
        {
            result |= static_cast<uint32_t>(readByte()) << (i * 8);
        }

        return result;
    };

private:
    std::unique_ptr<ChunkedBuffer> chunkedBuffer;
    uint32_t offset = 0;
};
