#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>

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
