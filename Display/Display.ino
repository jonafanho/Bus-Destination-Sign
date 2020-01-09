#include "Core.h"

Core<U8X8_SSD1322_NHD_256X64_4W_HW_SPI> front(256, 64, PA9, PA8);
Core<U8X8_SSD1322_NHD_256X64_4W_HW_SPI> side(256, 64, PA10, PA8);
Core<U8X8_SH1106_128X64_VCOMH0_4W_HW_SPI> back(128, 64, PA11, PA8);

SdFatSoftSpiEX<PB9, PB4, PB5> sd; // MISO, MOSI, CLK
File frontFolder, sideFolder, backFolder;

uint8_t currentFolder = 0;
const uint8_t MAX_FOLDERS = 10, SETTINGS_COUNT = 6;
const String SETTINGS[] = {
	"front_scale=",
	"front_crop=",
	"side_scale=",
	"side_crop=",
	"back_scale=",
	"back_crop=",
};
const uint8_t DEFAULT_SETTINGS[] = {3, 20, 3, 19, 1, 0};

void writeSettingsFile(char *name)
{
	File settingsFile;
	settingsFile.open(name, O_WRONLY | O_CREAT | O_TRUNC);
	for (uint8_t i = 0; i < SETTINGS_COUNT; i++)
		settingsFile.println(SETTINGS[i] + String(DEFAULT_SETTINGS[i]));
	settingsFile.flush();
	settingsFile.close();
}

void openAndIncrementFolder()
{
	char name[32];
	boolean frontEmpty = true, sideEmpty = true, backEmpty = true;
	while (frontEmpty && sideEmpty && backEmpty)
	{
		sprintf(name, "%d/front", currentFolder);
		frontEmpty = front.setFolder(name);

		sprintf(name, "%d/side", currentFolder);
		sideEmpty = side.setFolder(name);

		sprintf(name, "%d/back", currentFolder);
		backEmpty = back.setFolder(name);

		sprintf(name, "%d/settings.txt", currentFolder);

		currentFolder++;
		if (currentFolder == MAX_FOLDERS)
			currentFolder = 0;
	}

	File settingsFile;
	boolean validFile = true;
	uint8_t settingValues[6];
	if (settingsFile.open(name, O_RDONLY))
	{
		char buffer[128];
		settingsFile.read(buffer, 128);
		String text(buffer);

		for (uint8_t i = 0; i < SETTINGS_COUNT; i++)
		{
			settingValues[i] = DEFAULT_SETTINGS[i];

			int8_t settingIndex = text.indexOf(SETTINGS[i]);
			if (settingIndex < 0)
			{
				validFile = false;
				break;
			}

			text = text.substring(settingIndex + SETTINGS[i].length());

			int8_t crlfIndex = text.indexOf("\r\n");
			if (crlfIndex < 0)
			{
				validFile = false;
				break;
			}

			settingValues[i] = text.substring(0, crlfIndex).toInt();
		}

		settingsFile.close();
	}
	else
	{
		validFile = false;
	}

	if (!validFile)
		writeSettingsFile(name);

	front.setScaleCrop(settingValues[0], settingValues[1]);
	side.setScaleCrop(settingValues[2], settingValues[3]);
	back.setScaleCrop(settingValues[4], settingValues[5]);
}

void setup()
{
	front.display.begin();
	side.display.begin();
	back.display.begin();

	if (!sd.begin(PB6))
	{
		front.display.setFont(u8x8_font_5x7_f);
		front.display.drawString(0, 0, "SD card initialization failed.");
		while (true)
		{
		}
	}

	// default folders and settings files
	for (uint8_t i = 0; i < MAX_FOLDERS; i++)
	{
		char name[32];

		sprintf(name, "%d/front", i);
		sd.mkdir(name);
		sprintf(name, "%d/side", i);
		sd.mkdir(name);
		sprintf(name, "%d/back", i);
		sd.mkdir(name);

		sprintf(name, "%d/settings.txt", i);
		File settingsFile;
		if (settingsFile.open(name, O_RDONLY))
			settingsFile.close();
		else
			writeSettingsFile(name);
	}

	openAndIncrementFolder();
}

void loop()
{
	for (int j = 0; j < 2; j++)
	{
		front.loadBmp();
		side.loadBmp();
		for (int i = 0; i < 256; i++)
		{
			front.step(i);
			side.step(i);
			delay(2);
		}
		//front.draw();
	}
	openAndIncrementFolder();
}