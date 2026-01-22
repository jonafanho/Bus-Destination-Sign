#ifndef INIT_PRINT_H
#define INIT_PRINT_H

#include "esp_log.h"
#include "esp_err.h"
#include "freertos/task.h"

class InitPrint
{
public:
    InitPrint(const char *tag) : tag(tag) {};
    void init(bool result, const char *message)
    {
        if (result)
        {
            ESP_LOGI(tag, "%s initialization successful", message);
        }
        else
        {
            ESP_LOGE(tag, "%s initialization failed", message);
            while (true)
            {
                vTaskDelay(1);
            }
        }
    }

private:
    const char *tag;
};

#endif
