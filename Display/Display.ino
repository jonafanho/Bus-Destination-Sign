// u8g2 - Version: Latest
#include <U8g2lib.h>
#include <U8x8lib.h>

// SPI - Version: Latest
#include <SPI.h>

#include "Core.h"
#include "SdFat.h"

Core<U8X8_SSD1322_NHD_256X64_4W_HW_SPI> front(3, 256, 64, 0, PA9, PA8);
Core<U8X8_SSD1322_NHD_256X64_4W_HW_SPI> side(3, 256, 64, 0, PA10, PA8);
Core<U8X8_SH1106_128X64_VCOMH0_4W_HW_SPI> back(1, 128, 64, 0, PA11, PA8);

SdFatSoftSpiEX<PB9, PB4, PB5> sd; // MISO, MOSI, CLK
File frontFolder, sideFolder, backFolder;

void printFolder(FatFile folder)
{
	front.display.clear();
	char name[256];
	folder.getName(name, 256);
	front.display.drawString(0, 0, name);
	int i = 1;
	File file;
	while (file.openNext(&folder))
	{
		file.getName(name, 256);
		front.display.drawString(0, i, name);
		i++;
		file.close();
	}
	delay(500);
}

void setup()
{
	front.display.begin();
	side.display.begin();
	back.display.begin();
	front.display.setFont(u8x8_font_5x7_f);
	if (!sd.begin(PB6))
	{
		front.display.drawString(0, 0, "SD card initialization failed.");
		while (true)
		{
		}
	}
	sd.mkdir("front");
	sd.mkdir("side");
	sd.mkdir("back");
	frontFolder.open("/front");
	sideFolder.open("/side");
	backFolder.open("/back");
	printFolder(frontFolder);
	printFolder(sideFolder);
	printFolder(backFolder);

	//u8g2a2.begin();
}

void loop()
{
	File file;
	if (!file.openNext(&frontFolder))
	{
		frontFolder.rewindDirectory();
		file.openNext(&frontFolder);
	}
	front.loadBmp(file);
	side.loadBmp(file);
	file.close();
	for (int i = 0; i < 256; i++)
	{
		front.step(i);
		side.step(i);
		delay(2);
	}
	//front.draw();
}