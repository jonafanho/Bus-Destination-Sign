# Bus Destination Sign
A simulation of LED or flip dot bus destination signs using the STM32 Blue Pill.

## Quick Start
### First Run
1. Insert an empty micro SD card (formatted to FAT32) into the SD card slot.
1. Power up the STM32 microcontroller using a Micro USB cable. Nothing will show up on the display; this is normal.
### Adding Images
1. On a computer, download or obtain images to be shown on the destination signs. Some good sites include [HKBRDA](https://www.hkbrda.org/rddc/main.php) and [Stopreporter](https://sites.google.com/site/stopreporter2003/edisplay).
1. Convert all images to the BMP file format. [Online converter](https://image.online-convert.com/convert-to-bmp) is an easy site to convert images quickly.
1. Remove the micro SD card and insert it into the computer. Inside the SD card, there should be three folders: front, side, and back. If they don't exist, create them.
1. Copy the BMP files to any of the three folders (front, side or back) on the SD card.
1. Safely eject the SD card from the computer and reinsert the SD card to the SD card slot.
1. Power up the STM32 microcontroller again. The new images should show up on the displays.

## Configuration
* More to come soon!

## Troubleshooting
* My images are not showing up!
  * Make sure the images are in BMP format. (8, 16, 24, and 32-bit uncompressed BMP files are supported.)
  * Make sure the BMP files are in any of the three folders (front, side, or back). They shouldn't be anywhere else or nested inside those folders.
* My images take forever to load!
  * Keep the image sizes small, preferably smaller than 500x500 pixels.
