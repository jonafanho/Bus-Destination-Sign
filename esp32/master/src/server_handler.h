#pragma once

#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>

class ServerHandler
{
public:
    void init();
    void tick();

private:
    const char *WIFI_SSID = "";
    const char *WIFI_PASS = "";
    const char *AP_SSID = "RC Bus System Setup";
    const char *AP_PASS = "88888888";

    static constexpr unsigned long WIFI_CONNECT_TIMEOUT_MS = 10000;
    static constexpr unsigned long WIFI_RECONNECT_INTERVAL_MS = 30000;

    WebServer server{80};
    bool apMode = false;
    unsigned long lastReconnectAttempt = 0;

    static String getContentType(const String &path);
    bool serveFile(const String &path);
    bool serveSDFile(const String &path);

    void handleNotFound();
    void handleApiSave();
    void handleApiStatus();

    void startAP();
    bool connectSTA();
};
