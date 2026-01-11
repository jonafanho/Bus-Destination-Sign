#ifndef SETTINGS_H
#define SETTINGS_H

#include <ArduinoJson.h>
#include <SdFat.h>

class Settings
{
public:
    Settings(SdFat sd);
    void receiveFile();
    String getSettings();

private:
    SdFat sd;
};

#endif
