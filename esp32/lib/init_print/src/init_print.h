#pragma once

class InitPrint
{
public:
    InitPrint(const char *tag) : tag(tag) {};
    void init(bool result, const char *message)
    {
        if (result)
        {
            Serial.printf("[%s] %s initialization successful\n", tag, message);
        }
        else
        {
            Serial.printf("[%s] %s initialization failed\n", tag, message);
            while (true)
            {
                delay(1000);
            }
        }
    }

private:
    const char *tag;
};
