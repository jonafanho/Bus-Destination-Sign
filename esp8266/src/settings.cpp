#include "settings.h"
#include <LittleFS.h>

void Settings::receiveFile()
{
    if (Serial.available())
    {
        String fileName = Serial.readStringUntil('\n');
        fileName.trim();
        String sizeString = Serial.readStringUntil('\n');
        sizeString.trim();
        int fileSize = sizeString.toInt();

        if (fileName.equals("clear"))
        {
            LittleFS.format();
        }

        File file = LittleFS.open("/" + fileName, "w");
        if (file)
        {
            int received = 0;
            while (received < fileSize)
            {
                if (Serial.available())
                {
                    int fileByte = Serial.read();
                    if (fileByte >= 0)
                    {
                        file.write((uint8_t)fileByte);
                        received++;
                    }
                }
            }

            Serial.printf("OK:%s\n", fileName.c_str());
        }
        file.close();
    }
}

String Settings::getSettings()
{
    File file = LittleFS.open("/settings.json", "r");
    String settings = "";
    if (file)
    {
        settings = file.readString();
    }
    file.close();
    return settings;
}
