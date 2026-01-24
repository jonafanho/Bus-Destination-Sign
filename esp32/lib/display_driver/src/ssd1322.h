#ifndef SSD1322_H
#define SSD1322_H

#include "display_driver.h"
#include "esp_lcd_panel_io.h"

class SSD1322 : public DisplayDriver
{
public:
    SSD1322();
    bool initRaw() override;
    void pushRaw() override;

private:
    esp_lcd_i80_bus_handle_t busHandle = nullptr;
    esp_lcd_panel_io_handle_t panelHandle = nullptr;

    static constexpr gpio_num_t PIN_SCREEN_ENABLE = GPIO_NUM_13;

    static constexpr gpio_num_t PIN_D0 = GPIO_NUM_1;
    static constexpr gpio_num_t PIN_D1 = GPIO_NUM_2;
    static constexpr gpio_num_t PIN_D2 = GPIO_NUM_3;
    static constexpr gpio_num_t PIN_D3 = GPIO_NUM_4;
    static constexpr gpio_num_t PIN_D4 = GPIO_NUM_5;
    static constexpr gpio_num_t PIN_D5 = GPIO_NUM_6;
    static constexpr gpio_num_t PIN_D6 = GPIO_NUM_7;
    static constexpr gpio_num_t PIN_D7 = GPIO_NUM_8;

    static constexpr gpio_num_t PIN_WR = GPIO_NUM_9;
    static constexpr gpio_num_t PIN_DC = GPIO_NUM_10;
    static constexpr gpio_num_t PIN_CS = GPIO_NUM_11;
    static constexpr gpio_num_t PIN_RST = GPIO_NUM_14;

    typedef struct
    {
        uint8_t command;
        uint8_t params[2];
        uint8_t length;
    } sequence_t;

    void sendSequence(sequence_t *sequence, uint8_t count);
};

#endif
