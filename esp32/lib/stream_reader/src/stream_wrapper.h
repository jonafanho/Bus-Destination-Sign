#pragma once

#include <LittleFS.h>

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
    void init(uint8_t *buffer)
    {
        if (this->buffer)
        {
            free(buffer);
        };
        this->buffer = buffer;
    };

    void seek(uint32_t offset) override
    {
        this->offset = offset;
    };

    uint8_t readByte() override
    {
        return buffer[offset++];
    };

    uint32_t readInt() override
    {
        uint32_t result;
        memcpy(&result, buffer + offset, sizeof(result));
        offset += sizeof(result);
        return result;
    };

private:
    uint8_t *buffer = nullptr;
    uint32_t offset = 0;
};
