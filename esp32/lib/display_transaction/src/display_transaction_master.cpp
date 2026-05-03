#include "display_transaction_master.h"
#include "display_driver.h"

DisplayTransactionMaster::DisplayTransactionMaster(uint8_t displayIndex) : displayIndex(displayIndex) {}

bool DisplayTransactionMaster::init()
{
    return createDirectory("/display") && createDirectory((String("/display/display_") + (displayIndex + 1)).c_str());
}

void DisplayTransactionMaster::nextDisplay(SPIMaster *spiMaster)
{
    String path = String("/display/display_") + (displayIndex + 1) + "/group_" + (currentGroup + 1);

    // Open file
    FsFile file = SPIMaster::getSD().open(path.c_str(), O_RDONLY);

    if (file)
    {
        // Send to display
        spiMaster->send(file);
        file.close();
        currentGroup++;
    }
    else if (currentGroup > 0)
    {
        currentGroup = 0;
        nextDisplay(spiMaster);
    }
}

bool DisplayTransactionMaster::createDirectory(const char *path)
{
    SdFat &sdFat = SPIMaster::getSD();

    // Check if path exists
    if (sdFat.exists(path))
    {
        FsFile file = sdFat.open(path, O_RDONLY);
        if (file)
        {
            if (file.isDirectory())
            {
                file.close();
                return true;
            }
            else
            {
                file.close();
                sdFat.remove(path);
            }
        }
    }

    // Create directory
    return sdFat.mkdir(path);
}
