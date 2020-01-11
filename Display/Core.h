#ifndef CORE_H
#define CORE_H
#include "Arduino.h"
#include "SdFat.h"
#include "U8x8lib.h"

template <class T>
class Core
{
public:
	T display;

	Core(const uint16_t width, const uint16_t height, const uint8_t cs, const uint8_t dc) : WIDTH(width), HEIGHT(height), display(T(cs, dc)) {}

	void loadBmp()
	{

		// Copy old image
		for (uint16_t i = 0; i < IMAGE_BUFFER_SIZE; i++)
		{
			image[IMAGE_BUFFER_SIZE + i] = image[i];
			image[i] = 0;
		}

		// Read file
		File bmpFile;
		if (!bmpFile.openNext(&folder))
		{
			folder.rewindDirectory();
			if (!bmpFile.openNext(&folder))
				return;
		}

		// Check file name for fancy scroll
		char fileName[13];
		bmpFile.getName(fileName, 13);
		if (fileName[0] == 33) // !
		{
			fancyScroll = true;

			// Read left offset and divide
			if (fileName[1] >= 48 && fileName[1] < 58) // 0 to 9
				fancyScrollLeftOffset = fileName[1] - 48;
			else
				fancyScrollLeftOffset = 0;
			if (fileName[2] >= 48 && fileName[2] < 58) // 0 to 9
				fancyScrollDivide = fileName[2] - 48;
			else
				fancyScrollDivide = 6;

			// Clear old image
			for (uint16_t i = 0; i < IMAGE_BUFFER_SIZE; i++)
				image[IMAGE_BUFFER_SIZE + i] = 0;
		}
		else
		{
			fancyScroll = false;
		}

		// Parse BMP header
		if (read16(bmpFile) != 0x4D42) // BMP signature
			return;
		read32(bmpFile);					  // File size
		read32(bmpFile);					  // Reserved
		uint32_t bmpOffset = read32(bmpFile); // Start of image data
		read32(bmpFile);					  // Number of bytes in DIB header
		int32_t bmpWidth = read32(bmpFile);
		int32_t bmpHeight = read32(bmpFile);
		if (read16(bmpFile) != 1) // Planes: must be 1
			return;
		uint8_t bytesPerPixel = read16(bmpFile) / 8; // Bit depth -> bytes per pixel
		if (bytesPerPixel == 0)
			return;
		if (read32(bmpFile) != 0) // 0 = uncompressed
			return;

		// BMP rows are padded (if needed) to 4-byte boundary
		uint32_t rowSize = ((bmpWidth * bytesPerPixel + 3) / 4) * 4;
		boolean flip = true; // BMP is stored bottom-to-top
		if (bmpHeight < 0)
		{
			bmpHeight = -bmpHeight;
			flip = false;
		}

		uint32_t bmpReadWidth = min(WIDTH * (fancyScroll ? 2 : 1) * scale, bmpWidth - crop * 2);
		uint32_t bmpReadHeight = min(HEIGHT * scale, bmpHeight - crop * 2);

		uint32_t bmpReadLeft = (bmpWidth - bmpReadWidth) / 2;
		uint32_t bmpReadRight = bmpWidth - bmpReadLeft;
		uint32_t bmpReadTop = (bmpHeight - bmpReadHeight) / 2;
		uint32_t bmpReadBottom = bmpHeight - bmpReadTop;

		uint32_t screenWriteColumnStart = fancyScroll ? fancyScrollLeftOffset : ((WIDTH - min(bmpReadWidth / scale, WIDTH)) / 2);
		uint32_t screenWriteRowStart = (HEIGHT - min(bmpReadHeight / scale, HEIGHT)) / 2;

		uint8_t sdBuffer[SD_BUFFER_SIZE];
		uint8_t bufferIndex = SD_BUFFER_SIZE;
		for (uint16_t row = bmpReadTop; row < bmpReadBottom; row++)
		{
			if (scale != 1 && row % scale == scale - 1)
				continue;

			uint32_t pos = bmpOffset + (flip ? bmpHeight - row - 1 : row) * rowSize + bmpReadLeft * bytesPerPixel;
			if (bmpFile.position() != pos) // Need seek?
			{
				bmpFile.seek(pos);
				bufferIndex = SD_BUFFER_SIZE; // Force buffer reload
			}

			for (uint16_t column = bmpReadLeft; column < bmpReadRight; column++)
			{
				// Time to read more pixel data?
				if (bufferIndex >= SD_BUFFER_SIZE)
				{
					bmpFile.read(sdBuffer, SD_BUFFER_SIZE);
					bufferIndex = 0; // Set index to beginning
				}

				if (scale != 1 && column % scale == scale - 1)
				{
					bufferIndex += bytesPerPixel;
				}
				else
				{
					uint16_t screenDrawX = (column - bmpReadLeft) / scale + screenWriteColumnStart;
					uint16_t screenDrawY = (row - bmpReadTop) / scale + screenWriteRowStart;
					uint16_t arrayIndex;
					uint8_t arrayBit;

					if (XBM_MODE)
					{
						arrayIndex = screenDrawX / 8 + (screenDrawY * WIDTH * (fancyScroll ? 2 : 1) + 7) / 8;
						arrayBit = screenDrawX % 8;
					}
					else
					{
						arrayIndex = (screenDrawX % (WIDTH * (fancyScroll ? 2 : 1))) + screenDrawY / 8 * WIDTH * (fancyScroll ? 2 : 1);
						arrayBit = screenDrawY % 8;
					}

					if (arrayIndex >= IMAGE_BUFFER_SIZE * (fancyScroll ? 2 : 1))
						arrayIndex = IMAGE_BUFFER_SIZE * (fancyScroll ? 2 : 1) - 1;

					uint16_t p, r, g, b;
					switch (bytesPerPixel)
					{
					case 1:
						p = sdBuffer[bufferIndex++];
						r = ((p & 0b00110000) >> 4) * 64;
						g = ((p & 0b00001100) >> 2) * 64;
						b = (p & 0b00000011) * 64;
						break;
					case 2:
						p = (sdBuffer[bufferIndex++] << 8) + sdBuffer[bufferIndex++];
						r = ((p & 0b0000111100000000) >> 8) * 16;
						g = ((p & 0b0000000011110000) >> 4) * 16;
						b = (p & 0b0000000000001111) * 16;
						break;
					case 4:
						bufferIndex++;
					case 3:
						b = sdBuffer[bufferIndex++];
						g = sdBuffer[bufferIndex++];
						r = sdBuffer[bufferIndex++];
						break;
					}

					if (bytesPerPixel == 1) // Might find a better solution here later
						image[arrayIndex] |= ((r == 0 && (g > 0 || b > 0) ? 1 : 0) << arrayBit);
					else
						image[arrayIndex] |= ((r > 128 || g > 128 || b > 128 ? 1 : 0) << arrayBit);
				}
			}
		}

		bmpFile.close();
	}

	void draw()
	{
		if (fancyScroll)
		{
			for (uint16_t row = 0; row < HEIGHT / 8; row++)
				display.drawTile(0, row, WIDTH / 8, image + row * WIDTH * 2);

			delay(1000);

			const uint16_t numTiles = WIDTH / 8 - fancyScrollDivide;
			for (uint16_t step = 0; step < 256; step++)
			{
				uint8_t *imagePointer = image + fancyScrollDivide * 8 + step;
				for (uint16_t row = 0; row < HEIGHT / 8; row++)
					display.drawTile(fancyScrollDivide, row, numTiles, imagePointer + row * WIDTH * 2);
			}
		}
		else
		{
			for (uint16_t row = 0; row < HEIGHT / 8; row++)
				display.drawTile(0, row, WIDTH / 8, image + row * WIDTH);
		}
	}

	void step(const uint16_t step)
	{
		uint8_t stepMod = step % 8, stepRounded = step - stepMod;
		uint8_t tile[8];
		for (uint16_t y = 0; y < HEIGHT / 8; y++)
		{
			for (uint8_t i = 0; i < 8; i++)
				tile[i] = image[(i <= stepMod ? 0 : IMAGE_BUFFER_SIZE) + stepRounded + i + y * WIDTH];
			display.drawTile(step / 8, y, 1, tile);
		}
	}

	boolean setFolder(const char *newFolder)
	{
		folder.close();
		folder.open(newFolder);

		File testFile;
		boolean empty = !testFile.openNext(&folder);
		testFile.close();

		folder.rewindDirectory();
		return empty;
	}

	void setScaleCrop(const uint8_t s, const uint8_t c)
	{
		if (s > 0)
			scale = s;
		crop = c;
	}

private:
	uint8_t scale = 1, crop = 0, fancyScrollLeftOffset;
	uint16_t fancyScrollDivide;
	boolean fancyScroll = false;
	U8X8_PROGMEM uint8_t image[4096] = {}; // first 2048 bytes for new image, next 2048 bytes for old image (except for scrolling)
	File folder;

	const uint16_t WIDTH, HEIGHT, IMAGE_BUFFER_SIZE = 2048;

	static const uint8_t SD_BUFFER_SIZE = 3 * 20;
	static const boolean XBM_MODE = false;

	static uint16_t read16(File &f)
	{
		uint16_t result;
		((uint8_t *)&result)[0] = f.read(); // LSB
		((uint8_t *)&result)[1] = f.read(); // MSB
		return result;
	}

	static uint32_t read32(File &f)
	{
		uint32_t result;
		((uint8_t *)&result)[0] = f.read(); // LSB
		((uint8_t *)&result)[1] = f.read();
		((uint8_t *)&result)[2] = f.read();
		((uint8_t *)&result)[3] = f.read(); // MSB
		return result;
	}
};

#endif