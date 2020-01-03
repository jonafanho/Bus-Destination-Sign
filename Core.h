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
	U8X8_PROGMEM uint8_t imageNew[2048] = {}, imageOld[2048] = {};

	Core(const uint8_t scale, const uint16_t width, const uint16_t height, const uint8_t cs, const uint8_t dc) : SCALE(scale), WIDTH(width), HEIGHT(height), display(T(cs, dc)) {}

	void loadBmp(File &bmpFile)
	{
		// Parse BMP header
		if (read16(bmpFile) == 0x4D42) // BMP signature
		{
			read32(bmpFile);
			read32(bmpFile);					  // Read & ignore creator bytes
			uint32_t bmpOffset = read32(bmpFile); // Start of image data
			read32(bmpFile);					  // DIB header
			uint32_t bmpWidth = read32(bmpFile);
			uint32_t bmpHeight = read32(bmpFile);
			if (read16(bmpFile) == 1) // Planes: must be 1
			{
				uint16_t depth = read16(bmpFile); // bit depth
				if (read32(bmpFile) == 0)		  // 0 = uncompressed
				{
					// BMP rows are padded (if needed) to 4-byte boundary
					uint32_t rowSize = ((bmpWidth * (depth / 8) + 3) / 4) * 4;
					boolean flip = true; // BMP is stored bottom-to-top
					if (bmpHeight < 0)
					{
						bmpHeight = -bmpHeight;
						flip = false;
					}

					int bmpReadLeft = ((int)bmpWidth - (int)(WIDTH * SCALE)) / 2;
					int bmpReadRight = bmpWidth - bmpReadLeft;
					int screenWriteColumnStart = 0;
					if (bmpReadLeft < 0)
					{
						screenWriteColumnStart = -bmpReadLeft;
						bmpReadLeft = 0;
					}
					if (bmpReadRight > bmpWidth)
					{
						bmpReadRight = bmpWidth;
					}

					int bmpReadTop = ((int)bmpHeight - (int)(HEIGHT * SCALE)) / 2;
					int bmpReadBottom = bmpHeight - bmpReadTop;
					int screenWriteRowStart = 0;
					if (bmpReadTop < 0)
					{
						screenWriteRowStart = -bmpReadTop;
						bmpReadTop = 0;
					}
					if (bmpReadBottom > bmpHeight)
					{
						bmpReadBottom = bmpHeight;
					}

					// Copy old image
					for (uint16_t i = 0; i < 2048; i++)
					{
						imageOld[i] = imageNew[i];
						imageNew[i] = 0;
					}

					// Set TFT address window to clipped image bounds
					uint8_t sdBuffer[SD_BUFFER_SIZE];	 // pixel in buffer (R+G+B per pixel)
					uint8_t bufferIndex = SD_BUFFER_SIZE; // Current position in sdBuffer
					for (int row = bmpReadTop; row < bmpReadBottom; row++)
					{
						uint32_t pos = bmpOffset + (flip ? bmpHeight - 1 - row : row) * rowSize + bmpReadLeft * (depth == 24 ? 3 : 1);
						if (bmpFile.position() != pos) // Need seek?
						{
							bmpFile.seek(pos);
							bufferIndex = SD_BUFFER_SIZE; // Force buffer reload
						}

						for (int column = bmpReadLeft; column < bmpReadRight; column++)
						{
							// Time to read more pixel data?
							if (bufferIndex >= SD_BUFFER_SIZE)
							{
								bmpFile.read(sdBuffer, SD_BUFFER_SIZE);
								bufferIndex = 0; // Set index to beginning
							}

							boolean draw = (row % SCALE) <= (SCALE / 2) && (column % SCALE) <= (SCALE / 2);

							uint16_t screenDrawX = (column - bmpReadLeft + screenWriteColumnStart) / SCALE;
							uint16_t screenDrawY = (row - bmpReadTop + screenWriteRowStart) / SCALE;
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

							uint8_t arrayByte = imageNew[arrayIndex];

							if (depth == 24)
							{
								uint8_t b = sdBuffer[bufferIndex++];
								uint8_t g = sdBuffer[bufferIndex++];
								uint8_t r = sdBuffer[bufferIndex++];
								if (draw)
									arrayByte |= ((b > 128 || g > 128 || r > 128 ? 1 : 0) << arrayBit);
							}
							else
							{
								uint8_t p = sdBuffer[bufferIndex++];
								uint8_t r = (p & 0b00110000) >> 4;
								uint8_t g = (p & 0b00001100) >> 2;
								uint8_t b = (p & 0b00000011);
								if (draw)
									arrayByte |= ((r == 0 && (g > 0 || b > 0) ? 1 : 0) << arrayBit);
							}

							imageNew[arrayIndex] = arrayByte;
						}
					}
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
	const uint16_t WIDTH, HEIGHT;
	const uint8_t SD_BUFFER_SIZE = 3 * 20;
	const boolean XBM_MODE = false;

	uint16_t read16(File &f)
	{
		uint16_t result;
		((uint8_t *)&result)[0] = f.read(); // LSB
		((uint8_t *)&result)[1] = f.read(); // MSB
		return result;
	}

	uint32_t read32(File &f)
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