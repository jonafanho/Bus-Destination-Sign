#include "settings.h"

Settings::Settings(SdFat sd) : sd(sd) {}

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
            // sd.format();
        }

        File file = sd.open("/" + fileName, O_WRITE | O_CREAT | O_TRUNC);
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
    File file = sd.open("/settings.json");
    String settings = "";
    if (file)
    {
        settings = file.readString();
    }
    file.close();
    return settings;
}
