#ifndef SETTINGS_H
#define SETTINGS_H

#include <ArduinoJson.h>

class Settings
{
public:
    void receiveFile();
    String getSettings();
};

#endif
