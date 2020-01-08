// u8g2 - Version: Latest
#include <U8g2lib.h>
#include <U8x8lib.h>

// SPI - Version: Latest
#include <SPI.h>

#include "Core.h"
#include "SdFat.h"

Core<U8X8_SSD1322_NHD_256X64_4W_HW_SPI> front(256, 64, PA9, PA8);
Core<U8X8_SSD1322_NHD_256X64_4W_HW_SPI> side(256, 64, PA10, PA8);
Core<U8X8_SH1106_128X64_VCOMH0_4W_HW_SPI> back(128, 64, PA11, PA8);

SdFatSoftSpiEX<PB9, PB4, PB5> sd; // MISO, MOSI, CLK
File frontFolder, sideFolder, backFolder;

uint8_t currentFolder = 0;
const uint8_t MAX_FOLDERS = 10;

void openAndIncrementFolder()
{
	char folderName[8];

	sprintf(folderName, "%d/front", currentFolder);
	front.setFolder(folderName);

	sprintf(folderName, "%d/side", currentFolder);
	side.setFolder(folderName);

	sprintf(folderName, "%d/back", currentFolder);
	back.setFolder(folderName);

	if (currentFolder < MAX_FOLDERS)
		currentFolder++;
	else
		currentFolder = 0;
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

	for (uint8_t i = 0; i < MAX_FOLDERS; i++)
	{
		char folderName[8];
		sprintf(folderName, "%d/front", i);
		sd.mkdir(folderName);
		sprintf(folderName, "%d/side", i);
		sd.mkdir(folderName);
		sprintf(folderName, "%d/back", i);
		sd.mkdir(folderName);
	}

	openAndIncrementFolder();
}

void loop()
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