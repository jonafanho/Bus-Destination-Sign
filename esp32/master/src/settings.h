#pragma once

#include <Arduino.h>

class Settings
{
public:
    bool loadWiFiCredentials();
    String getWifiSsid() const { return wifiSsid; }
    String getWifiPassword() const { return wifiPassword; }

private:
    String wifiSsid;
    String wifiPassword;
};
