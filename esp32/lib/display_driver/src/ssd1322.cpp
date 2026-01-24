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
        .max_transfer_bytes = (size_t)screenWidth * screenHeight / 2,
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
    sequence_t sequence[] = {
        {0xFD, {0x12}, 1},       // Unlock
        {0xAE, {}, 0},           // Display off
        {0xB3, {0x91}, 1},       // Display clock
        {0xCA, {0x3F}, 1},       // Mux ratio
        {0xA2, {0x00}, 1},       // Display offset
        {0xA1, {0x00}, 1},       // Start line
        {0xA0, {0x06, 0x11}, 2}, // Re-map
        {0xAB, {0x01}, 1},       // Internal VDD
        {0xB4, {0xA0, 0xFD}, 2}, // Display enhance
        {0xC1, {0x9F}, 1},       // Contrast
        {0xC7, {0x0F}, 1},       // Phase length
        {0xB9, {}, 0},           // Default gamma
        {0xB1, {0xE2}, 1},       // First pre-charge
        {0xD1, {0xA2, 0x20}, 2}, // VSHAL
        {0xBB, {0x1F}, 1},       // Pre-charge voltage
        {0xB6, {0x08}, 1},       // Second pre-charge
        {0xBE, {0x07}, 1},       // VCOMH
        {0xA6, {}, 0},           // Normal display
        {0xA9, {}, 0},           // Exit partial display
        {0xAF, {}, 0},           // Display on
    };

    sendSequence(sequence, 20);
    return true;
}

void SSD1322::pushRaw()
{
    sequence_t sequence[] = {
        {0x15, {28, 91}, 2},
        {0x75, {0, 63}, 2},
    };

    sendSequence(sequence, 2);
    esp_lcd_panel_io_tx_color(panelHandle, 0x5C, buffer, screenWidth * screenHeight / 2);
}

void SSD1322::sendSequence(sequence_t *sequence, uint8_t count)
{
    for (uint8_t i = 0; i < count; i++)
    {
        esp_lcd_panel_io_tx_param(panelHandle, sequence[i].command, sequence[i].length == 0 ? nullptr : sequence[i].params, sequence[i].length);
    }
}
