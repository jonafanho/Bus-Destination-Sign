#include <vector>
#include "display_transaction_master.h"
#include "display_driver.h"
#include "sdmmc_cmd.h"
#include "esp_vfs_fat.h"

DisplayTransactionMaster::DisplayTransactionMaster(SPIMaster *spiMaster, uint8_t displayIndex) : spiMaster(spiMaster), displayIndex(displayIndex) {}

bool DisplayTransactionMaster::initSD()
{
    sdmmc_host_t host = SDSPI_HOST_DEFAULT();
    host.slot = SPI2_HOST;

    sdspi_device_config_t slotConfig = SDSPI_DEVICE_CONFIG_DEFAULT();
    slotConfig.gpio_cs = PIN_CS;
    slotConfig.host_id = SPI2_HOST;

    esp_vfs_fat_sdmmc_mount_config_t mountConfig = {
        .format_if_mount_failed = true,
        .max_files = 5,
        .allocation_unit_size = 16 * 1024,
    };

    sdmmc_card_t *card;
    bool result = esp_vfs_fat_sdspi_mount("/sdcard", &host, &slotConfig, &mountConfig, &card) == ESP_OK;
    sdmmc_card_print_info(stdout, card);
    return result;
}

bool DisplayTransactionMaster::init()
{
    char path[24];
    snprintf(path, 24, "/sdcard/display_%d", displayIndex);

    struct stat fileStat;

    // Check if path exists
    if (stat(path, &fileStat) == 0)
    {
        // If the path exists
        if (S_ISDIR(fileStat.st_mode))
        {
            // If the path is a directory
            return true;
        }
        else
        {
            // If the path is not a directory, delete the file
            if (unlink(path) != 0)
            {
                return false;
            }
        }
    }

    // Create directory
    return mkdir(path, 0775) == 0;
}

void DisplayTransactionMaster::nextDisplay()
{
    char path[32];
    snprintf(path, 32, "/sdcard/display_%d/group_%d", displayIndex, currentGroup);

    // Read the file
    FILE *file = fopen(path, "rb");

    if (file)
    {
        // Get file size
        fseek(file, 0, SEEK_END);
        long size = ftell(file);
        fseek(file, 0, SEEK_SET);

        // Send to display
        if (size > 0 && size <= INT32_MAX)
        {
            std::vector<uint8_t> buffer(size);
            fread(buffer.data(), 1, size, file);
            spiMaster->send(buffer, size);
        }

        fclose(file);
    }
    else if (currentGroup > 0)
    {
        currentGroup = 0;
        nextDisplay();
    }
}
