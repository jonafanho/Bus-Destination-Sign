#include "server_handler.h"
#include "spi_master.h"
#include <LittleFS.h>
#include <functional>

void ServerHandler::init(Settings *settings)
{
    if (!connectSTA(settings))
    {
        startAP();
    }

    // Register routes
    server.on("/api/saveData", HTTP_POST, std::bind(&ServerHandler::handleApiSaveData, this));
    server.on("/api/status", HTTP_GET, std::bind(&ServerHandler::handleApiStatus, this));
    server.onNotFound(std::bind(&ServerHandler::handleNotFound, this));

    server.begin();
    Serial.println("[Web] Server started on port 80");
}

void ServerHandler::tick(Settings *settings)
{
    server.handleClient();

    // Auto-reconnect in STA mode
    if (!apMode && WiFi.status() != WL_CONNECTED)
    {
        unsigned long currentMillis = millis();
        if (currentMillis - lastReconnectAttempt >= WIFI_RECONNECT_INTERVAL)
        {
            WiFi.disconnect();
            connectSTA(settings);
            lastReconnectAttempt = currentMillis;
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

    if (filePath.endsWith("/displays.dat") || filePath.endsWith("/index.json"))
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
    FsFile file = SPIMaster::getSD().open(path.c_str(), O_RDONLY);
    if (!file)
    {
        return false;
    }

    uint32_t fileSize = file.fileSize();
    server.setContentLength(fileSize);
    server.send(200, getContentType(path), "");

    uint8_t buffer[CHUNK_SIZE];
    int bytesRead;
    while ((bytesRead = file.read(buffer, sizeof(buffer))) > 0)
    {
        server.sendContent(reinterpret_cast<const char *>(buffer), bytesRead);
    }

    file.close();
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

void ServerHandler::handleApiSaveData()
{
    String payload = server.arg("plain");
    unsigned int payloadLength = payload.length();
    if (payloadLength == 0)
    {
        server.send(400, "application/json", "{\"error\":\"No data received\"}");
        return;
    }

    FsFile file = SPIMaster::getSD().open("/settings.json", O_WRONLY | O_CREAT | O_TRUNC);
    if (!file)
    {
        server.send(500, "application/json", "{\"error\":\"Failed to open file for writing\"}");
        return;
    }

    unsigned int writtenLength = file.write(reinterpret_cast<const uint8_t *>(payload.c_str()), payloadLength);
    file.close();

    if (writtenLength != payloadLength)
    {
        server.send(500, "application/json", "{\"error\":\"Failed to write complete data\"}");
        return;
    }

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

bool ServerHandler::connectSTA(Settings *settings)
{
    if (!settings->loadWiFiCredentials())
    {
        return false;
    }

    WiFi.mode(WIFI_STA);
    WiFi.begin(settings->getWifiSsid(), settings->getWifiPassword());
    Serial.printf("[WiFi] Connecting to %s", settings->getWifiSsid());

    unsigned long currentMillis = millis();
    while (WiFi.status() != WL_CONNECTED && (millis() - currentMillis) < WIFI_CONNECT_TIMEOUT)
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
