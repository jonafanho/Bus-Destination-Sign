#ifndef CORE_H
#define CORE_H

#include "Arduino.h"
#include "U8x8lib.h"

template<class T>
class Core {
public:
	static const uint16_t IMAGE_BUFFER_SIZE = 2048, SCROLL_BUFFER_SIZE = 4096;

	T display;

	Core(const uint16_t width, const uint16_t height, const uint8_t cs, const uint8_t dc) : WIDTH(width), HEIGHT(height), display(T(cs, dc)) {}

	void setImage(uint16_t index, uint8_t value) {
		image[IMAGE_BUFFER_SIZE + index] = image[index];
		image[index] = value;
	}

	void setFancyScrollImage(uint16_t index, uint8_t value) {
		image[index + IMAGE_BUFFER_SIZE * 2] = value;
	}

	void draw() {
		const uint16_t widthChunk = WIDTH / 8;
		const uint16_t heightChunk = HEIGHT / 8;
		for (uint16_t row = 0; row < heightChunk; row++) {
			display.drawTile(0, row, widthChunk, image + row * WIDTH);
		}
	}

	void fancyScroll() {
		const uint16_t widthChunk = WIDTH / 8;
		const uint16_t heightChunk = HEIGHT / 8;


		const uint16_t bufferOffset = IMAGE_BUFFER_SIZE * 2 + 6 + 8;
		const uint16_t fancyScrollDivide = (image[IMAGE_BUFFER_SIZE * 2] << 8) + image[IMAGE_BUFFER_SIZE * 2 + 1];
		const uint16_t fancyScrollDivideChunk = fancyScrollDivide / 8;
		const uint16_t scrollWidth = (image[IMAGE_BUFFER_SIZE * 2 + 2] << 8) + image[IMAGE_BUFFER_SIZE * 2 + 3];
		uint16_t scale = (image[IMAGE_BUFFER_SIZE * 2 + 4] << 8) + image[IMAGE_BUFFER_SIZE * 2 + 5];
		if (scale <= 0) {
			scale = 1;
		}

		const uint16_t numTiles = widthChunk - fancyScrollDivideChunk;
		for (uint16_t step = WIDTH - 1; step >= fancyScrollDivide; step -= scale) {
			const uint16_t startTile = step / 8;
			uint8_t *imagePointer = image - 1 - (step % 8) + bufferOffset;
			for (uint16_t row = 0; row < heightChunk; row++) {
				display.drawTile(startTile, row, numTiles, imagePointer + row * scrollWidth);
			}
			delay(1);
		}

		for (uint16_t step = 0; step < scrollWidth - 8; step += scale) {
			const uint16_t numTiles2 = (scrollWidth - step) / 8;
			uint8_t *imagePointer = image + step + bufferOffset;
			for (uint16_t row = 0; row < heightChunk; row++) {
				display.drawTile(fancyScrollDivideChunk, row, numTiles < numTiles2 ? numTiles : numTiles2, imagePointer + row * scrollWidth);
			}
			delay(1);
		}
	}

	void step(const uint16_t step) {
		uint8_t stepMod = step % 8, stepRounded = step - stepMod;
		uint8_t tile[8];
		for (uint16_t y = 0; y < HEIGHT / 8; y++) {
			for (uint8_t i = 0; i < 8; i++)
				tile[i] = image[(i <= stepMod ? 0 : IMAGE_BUFFER_SIZE) + stepRounded + i + y * WIDTH];
			display.drawTile(step / 8, y, 1, tile);
		}
	}

private:
	const uint16_t WIDTH, HEIGHT;

	U8X8_PROGMEM uint8_t
	image[IMAGE_BUFFER_SIZE * 2 + SCROLL_BUFFER_SIZE] = {}; // first 2048 bytes for new image, next 2048 bytes for old image, next 4096 bytes for scroll
};

#endif