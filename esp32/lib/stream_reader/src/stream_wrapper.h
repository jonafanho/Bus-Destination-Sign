#pragma once

#include "spi_device.h"
#include <LittleFS.h>
#include <cstdint>
#include <memory>

class StreamWrapper
{
public:
    virtual void seek(uint32_t offset) = 0;
    virtual uint8_t readByte() = 0;
    virtual uint32_t readInt() = 0;
};

class FileStreamWrapper : public StreamWrapper
{
public:
    bool init(const char *fileName)
    {
        file = LittleFS.open(fileName, "r");
        return file;
    };

    void seek(uint32_t offset) override
    {
        file.seek(offset);
    };

    uint8_t readByte() override
    {
        uint8_t result;
        file.readBytes((char *)&result, sizeof(result));
        return result;
    };

    uint32_t readInt() override
    {
        uint32_t result;
        file.readBytes((char *)&result, sizeof(result));
        return result;
    };

private:
    File file;
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
            return 0;

        // Map offset to chunk and index within chunk
        uint32_t chunkIdx = offset / CHUNK_SIZE;
        uint32_t chunkOffset = offset % CHUNK_SIZE;

        if (chunkIdx >= chunkedBuffer->chunks.size())
            return 0;

        uint8_t value = (*chunkedBuffer->chunks[chunkIdx])[chunkOffset];
        offset++;
        return value;
    };

    uint32_t readInt() override
    {
        if (!chunkedBuffer || offset + sizeof(uint32_t) > chunkedBuffer->totalLength)
            return 0;

        // Read 4 bytes, handling potential chunk boundary
        uint8_t bytes[4];
        for (int i = 0; i < 4; i++)
        {
            bytes[i] = readByte();
        }

        uint32_t result;
        memcpy(&result, bytes, sizeof(result));
        return result;
    };

    uint32_t getTotalLength() const
    {
        return chunkedBuffer ? chunkedBuffer->totalLength : 0;
    };

private:
    std::unique_ptr<ChunkedBuffer> chunkedBuffer;
    uint32_t offset = 0;
};
