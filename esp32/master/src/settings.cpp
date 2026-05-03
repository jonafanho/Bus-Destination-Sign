#include "settings.h"
#include "spi_master.h"
#include <ArduinoJson.h>

bool Settings::loadWiFiCredentials()
{
    wifiSsid = "";
    wifiPassword = "";

    // Open settings.json from SD card root
    FsFile file = SPIMaster::getSD().open("/settings.json", O_RDONLY);
    if (!file)
    {
        return false;
    }

    JsonDocument jsonDocument;
    DeserializationError error = deserializeJson(jsonDocument, file);
    file.close();

    if (error)
    {
        return false;
    }

    JsonObject settingsObject = jsonDocument["settings"];
    if (!settingsObject.isNull())
    {
        const char *ssid = settingsObject["wifiSSID"];
        const char *pass = settingsObject["wifiPassword"];
        if (ssid)
        {
            wifiSsid = ssid;
        }
        if (pass)
        {
            wifiPassword = pass;
        }
    }

    return wifiSsid.length() > 0;
}
