#include "ssd1322.h"
#include "esp_lcd_panel_ops.h"

SSD1322::SSD1322() : DisplayDriver(256, 64, GPIO_NUM_13) {}

bool SSD1322::initRaw()
{
    // Reset
    gpio_set_direction(PIN_RST, GPIO_MODE_OUTPUT);
    GPIO.out_w1tc = (1 << PIN_RST);
    vTaskDelay(100);
    GPIO.out_w1ts = (1 << PIN_RST);
    vTaskDelay(100);

    esp_lcd_i80_bus_config_t busConfig = {
        .dc_gpio_num = PIN_DC,
        .wr_gpio_num = PIN_WR,
        .data_gpio_nums = {PIN_D0, PIN_D1, PIN_D2, PIN_D3, PIN_D4, PIN_D5, PIN_D6, PIN_D7},
        .bus_width = 8,
        .max_transfer_bytes = screenWidth * screenHeight / 2,
        .psram_trans_align = 64,
    };

    if (esp_lcd_new_i80_bus(&busConfig, &busHandle) != ESP_OK)
    {
        return false;
    }

    esp_lcd_panel_io_i80_config_t ioConfig = {
        .cs_gpio_num = PIN_CS,
        .pclk_hz = 10 * 1000 * 1000, // 10MHz
        .trans_queue_depth = 10,
        .on_color_trans_done = nullptr,
        .user_ctx = nullptr,
        .lcd_cmd_bits = 8,
        .lcd_param_bits = 8,
    };

    if (esp_lcd_new_panel_io_i80(busHandle, &ioConfig, &panelHandle) != ESP_OK)
    {
        return false;
    }

    // Init sequence
    esp_lcd_panel_io_tx_param(panelHandle, 0xFD, (uint8_t[]){0x12}, 1);       // Unlock
    esp_lcd_panel_io_tx_param(panelHandle, 0xAE, nullptr, 0);                 // Display off
    esp_lcd_panel_io_tx_param(panelHandle, 0xB3, (uint8_t[]){0x91}, 1);       // Display clock
    esp_lcd_panel_io_tx_param(panelHandle, 0xCA, (uint8_t[]){0x3F}, 1);       // Mux ratio
    esp_lcd_panel_io_tx_param(panelHandle, 0xA2, (uint8_t[]){0x00}, 1);       // Display offset
    esp_lcd_panel_io_tx_param(panelHandle, 0xA1, (uint8_t[]){0x00}, 1);       // Start line
    esp_lcd_panel_io_tx_param(panelHandle, 0xA0, (uint8_t[]){0x06, 0x11}, 2); // Re-map
    esp_lcd_panel_io_tx_param(panelHandle, 0xAB, (uint8_t[]){0x01}, 1);       // Internal VDD
    esp_lcd_panel_io_tx_param(panelHandle, 0xB4, (uint8_t[]){0xA0, 0xFD}, 2); // Display enhance
    esp_lcd_panel_io_tx_param(panelHandle, 0xC1, (uint8_t[]){0x9F}, 1);       // Contrast
    esp_lcd_panel_io_tx_param(panelHandle, 0xC7, (uint8_t[]){0x0F}, 1);       // Phase length
    esp_lcd_panel_io_tx_param(panelHandle, 0xB9, nullptr, 0);                 // Default gamma
    esp_lcd_panel_io_tx_param(panelHandle, 0xB1, (uint8_t[]){0xE2}, 1);       // First pre-charge
    esp_lcd_panel_io_tx_param(panelHandle, 0xD1, (uint8_t[]){0xA2, 0x20}, 2); // VSHAL
    esp_lcd_panel_io_tx_param(panelHandle, 0xBB, (uint8_t[]){0x1F}, 1);       // Pre-charge voltage
    esp_lcd_panel_io_tx_param(panelHandle, 0xB6, (uint8_t[]){0x08}, 1);       // Second pre-charge
    esp_lcd_panel_io_tx_param(panelHandle, 0xBE, (uint8_t[]){0x07}, 1);       // VCOMH
    esp_lcd_panel_io_tx_param(panelHandle, 0xA6, nullptr, 0);                 // Normal display
    esp_lcd_panel_io_tx_param(panelHandle, 0xA9, nullptr, 0);                 // Exit partial display
    esp_lcd_panel_io_tx_param(panelHandle, 0xAF, nullptr, 0);                 // Display on

    return true;
}

void SSD1322::pushRaw()
{
    esp_lcd_panel_io_tx_param(panelHandle, 0x15, (uint8_t[]){28, 91}, 2);
    esp_lcd_panel_io_tx_param(panelHandle, 0x75, (uint8_t[]){0, 63}, 2);
    esp_lcd_panel_io_tx_color(panelHandle, 0x5C, buffer, screenWidth * screenHeight / 2);
}
