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

	Core(const uint8_t scale, const uint16_t width, const uint16_t height, const uint16_t crop, const uint8_t cs, const uint8_t dc) : SCALE(scale), WIDTH(width), HEIGHT(height), CROP(crop), display(T(cs, dc)) {}

	void loadBmp(File &bmpFile)
	{
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

		// Copy old image
		for (uint16_t i = 0; i < 2048; i++)
		{
			imageOld[i] = imageNew[i];
			imageNew[i] = 0;
		}

		// BMP rows are padded (if needed) to 4-byte boundary
		uint32_t rowSize = ((bmpWidth * bytesPerPixel + 3) / 4) * 4;
		boolean flip = true; // BMP is stored bottom-to-top
		if (bmpHeight < 0)
		{
			bmpHeight = -bmpHeight;
			flip = false;
		}

		uint32_t bmpReadWidth = min(WIDTH * SCALE, bmpWidth - CROP * 2);
		uint32_t bmpReadHeight = min(HEIGHT * SCALE, bmpHeight - CROP * 2);

		uint32_t bmpReadLeft = (bmpWidth - bmpReadWidth) / 2;
		uint32_t bmpReadRight = bmpWidth - bmpReadLeft;
		uint32_t bmpReadTop = (bmpHeight - bmpReadHeight) / 2;
		uint32_t bmpReadBottom = bmpHeight - bmpReadTop;

		uint32_t screenWriteColumnStart = (WIDTH - min(bmpReadWidth / SCALE, WIDTH)) / 2;
		uint32_t screenWriteRowStart = (HEIGHT - min(bmpReadHeight / SCALE, HEIGHT)) / 2;

		uint8_t sdBuffer[SD_BUFFER_SIZE];
		uint8_t bufferIndex = SD_BUFFER_SIZE;
		for (uint16_t row = bmpReadTop; row < bmpReadBottom; row++)
		{
			if (row % SCALE == SCALE - 1)
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

				if (column % SCALE == SCALE - 1)
				{
					bufferIndex += bytesPerPixel;
				}
				else
				{
					uint16_t screenDrawX = (column - bmpReadLeft) / SCALE + screenWriteColumnStart;
					uint16_t screenDrawY = (row - bmpReadTop) / SCALE + screenWriteRowStart;
					uint16_t arrayIndex;
					uint8_t arrayBit;

					if (XBM_MODE)
					{
						arrayIndex = screenDrawX / 8 + (screenDrawY * WIDTH + 7) / 8;
						arrayBit = screenDrawX % 8;
					}
					else
					{
						arrayIndex = (screenDrawX % WIDTH) + screenDrawY / 8 * WIDTH;
						arrayBit = screenDrawY % 8;
					}

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
						imageNew[arrayIndex] |= ((r == 0 && (g > 0 || b > 0) ? 1 : 0) << arrayBit);
					else
						imageNew[arrayIndex] |= ((r > 64 || g > 64 || b > 64 ? 1 : 0) << arrayBit);
				}
			}
		}
	}

	void draw()
	{
		for (int i = 0; i < HEIGHT / 8; i++)
			display.drawTile(0, i, WIDTH / 8, imageNew + i * WIDTH);
	}

	void step(uint16_t step)
	{
		uint8_t stepMod = step % 8, stepRounded = step - stepMod;
		uint8_t tile[8];
		for (uint16_t y = 0; y < HEIGHT / 8; y++)
		{
			for (uint8_t i = 0; i < 8; i++)
				tile[i] = i <= stepMod ? imageNew[stepRounded + i + y * WIDTH] : imageOld[stepRounded + i + y * WIDTH];
			display.drawTile(step / 8, y, 1, tile);
		}
	}

private:
	const uint8_t SCALE;
	const uint16_t WIDTH, HEIGHT, CROP;

	static const uint8_t SD_BUFFER_SIZE = 3 * 20;
	static const boolean XBM_MODE = false;

	U8X8_PROGMEM uint8_t imageNew[2048] = {}, imageOld[2048] = {};

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