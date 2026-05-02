#pragma once

#include "settings.h"
#include <Arduino.h>
#include <WebServer.h>

class ServerHandler
{
public:
    void init(Settings *settings);
    void tick(Settings *settings);

private:
    const char *AP_SSID = "RC Bus System Setup";
    const char *AP_PASS = "88888888";

    static constexpr uint16_t WIFI_CONNECT_TIMEOUT = 10000;
    static constexpr uint16_t WIFI_RECONNECT_INTERVAL = 30000;

    WebServer server{80};
    bool apMode = false;
    unsigned long lastReconnectAttempt = 0;

    static String getContentType(const String &path);
    bool serveFile(const String &path);
    bool serveSDFile(const String &path);

    void handleNotFound();
    void handleApiSaveData();
    void handleApiStatus();

    void startAP();
    bool connectSTA(Settings *settings);
};
