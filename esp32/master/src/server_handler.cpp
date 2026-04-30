#include "server_handler.h"
#include <LittleFS.h>
#include <cstdio>

void ServerHandler::init()
{
    // Decide STA vs AP
    if (strlen(WIFI_SSID) == 0 || !connectSTA())
    {
        startAP();
    }

    // Register routes
    server.on("/api/save", HTTP_POST, [this]()
              { handleApiSave(); });
    server.on("/api/status", HTTP_GET, [this]()
              { handleApiStatus(); });
    server.onNotFound([this]()
                      { handleNotFound(); });

    server.begin();
    Serial.println("[Web] Server started on port 80");
}

void ServerHandler::tick()
{
    server.handleClient();

    // Auto-reconnect in STA mode
    if (!apMode && WiFi.status() != WL_CONNECTED)
    {
        unsigned long currentMillis = millis();
        if (currentMillis - lastReconnectAttempt >= WIFI_RECONNECT_INTERVAL_MS)
        {
            lastReconnectAttempt = currentMillis;
            Serial.println("[WiFi] Disconnected, attempting reconnect...");
            WiFi.disconnect();
            WiFi.begin(WIFI_SSID, WIFI_PASS);
        }
    }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

String ServerHandler::getContentType(const String &path)
{
    if (path.endsWith(".html"))
        return "text/html";
    if (path.endsWith(".css"))
        return "text/css";
    if (path.endsWith(".js"))
        return "application/javascript";
    if (path.endsWith(".json"))
        return "application/json";
    if (path.endsWith(".png"))
        return "image/png";
    if (path.endsWith(".jpg"))
        return "image/jpeg";
    if (path.endsWith(".ico"))
        return "image/x-icon";
    if (path.endsWith(".svg"))
        return "image/svg+xml";
    return "text/plain";
}

bool ServerHandler::serveFile(const String &path)
{
    String filePath = path;
    if (filePath.endsWith("/"))
    {
        filePath += "index.html";
    }

    if (filePath.endsWith(".dat"))
    {
        return serveSDFile(filePath);
    }

    if (!LittleFS.exists(filePath))
    {
        return false;
    }

    File file = LittleFS.open(filePath, "r");
    if (file)
    {
        server.streamFile(file, getContentType(filePath));
        file.close();
        return true;
    }
    else
    {
        return false;
    }
}

bool ServerHandler::serveSDFile(const String &path)
{
    String sdPath = "/sdcard" + path;
    FILE *file = fopen(sdPath.c_str(), "rb");
    if (!file)
    {
        return false;
    }

    fseek(file, 0, SEEK_END);
    long fileSize = ftell(file);
    fseek(file, 0, SEEK_SET);

    server.setContentLength(fileSize);
    server.send(200, getContentType(path), "");

    uint8_t buf[512];
    size_t bytesRead;
    while ((bytesRead = fread(buf, 1, sizeof(buf), file)) > 0)
    {
        server.sendContent(reinterpret_cast<const char *>(buf), bytesRead);
    }

    fclose(file);
    return true;
}

// ── Route handlers ──────────────────────────────────────────────────────────

void ServerHandler::handleNotFound()
{
    if (!serveFile(server.uri()))
    {
        server.send(404, "text/plain", "Not found");
    }
}

void ServerHandler::handleApiSave()
{
    // TODO: implement save logic
    server.send(200, "application/json", "{\"status\":\"ok\"}");
}

void ServerHandler::handleApiStatus()
{
    String json = "{\"apMode\":";
    json += apMode ? "true" : "false";
    json += ",\"ssid\":\"";
    json += WiFi.SSID();
    json += "\",\"ip\":\"";
    json += WiFi.localIP().toString();
    json += "\"}";
    server.send(200, "application/json", json);
}

// ── Wi-Fi management ────────────────────────────────────────────────────────

void ServerHandler::startAP()
{
    apMode = true;
    WiFi.mode(WIFI_AP);
    WiFi.softAP(AP_SSID, AP_PASS);
    Serial.print("[WiFi] AP SSID: ");
    Serial.println(AP_SSID);
    Serial.print("[WiFi] AP IP: ");
    Serial.println(WiFi.softAPIP());
}

bool ServerHandler::connectSTA()
{
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    Serial.printf("[WiFi] Connecting to %s", WIFI_SSID);

    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED && (millis() - start) < WIFI_CONNECT_TIMEOUT_MS)
    {
        delay(500);
        Serial.print(".");
    }
    Serial.println();

    if (WiFi.status() == WL_CONNECTED)
    {
        Serial.print("[WiFi] Connected, IP: ");
        Serial.println(WiFi.localIP());
        return true;
    }

    Serial.println("[WiFi] Connection failed");
    return false;
}
