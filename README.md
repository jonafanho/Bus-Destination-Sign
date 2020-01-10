# Bus Destination Sign
A simulation of LED or flip dot bus destination signs using the STM32 Blue Pill.

## Quick Start
### First Run
1. Insert an empty micro SD card (formatted to FAT32) into the SD card slot.
1. Power up the STM32 microcontroller using a Micro USB cable.
1. After the system finishes loading, the screen will turn black. The necessary folders and configuration files will be automatically set up on the SD card.
1. Turn off the microcontroller by unplugging the Micro USB cable, then remove the SD card from the SD card slot.

### Adding Images
1. On a computer, download or obtain images to be shown on the destination signs. Some good sites include [HKBRDA](https://www.hkbrda.org/rddc/main.php) and [Stopreporter](https://sites.google.com/site/stopreporter2003/edisplay).
1. Convert all images into the BMP file format. [Online converter](https://image.online-convert.com/convert-to-bmp) is an easy site to convert images quickly.
1. Open the SD card on the computer. Inside the SD card, you should see the following folders:
   * In the root directory, there should be ten folders named `0` to `9`. These folders group images of the same bus routes together.
   * In each of the ten folders, there should be three folders named `front`, `side`, and `back`. These folders designate which images appear on the front, side, and rear displays.
   * If these folders don't exist, follow the [First Run](#first-run) steps above to automatically create the necessary folders and configuration files.
1. Copy the BMP files to any of the `front`, `side`, or `back` folders on the SD card.
   * Images of the same bus route should be grouped together.
   * Images of the front, side, and back displays should go into their respective folders.
   * An example of the SD card file structure is shown [below](#example-sd-card-file-structure).
1. Safely eject the SD card from the computer and reinsert the SD card to the SD card slot.
1. Power up the STM32 microcontroller again.
   * The images from `0/front`, `0/side`, and `0/back` should show up on the front, side, and back displays respectively.
   * On the device or a connected remote, press the button to change routes. The images from `1/front`, `1/side`, and `1/back` should now show up.
   * Pressing the button again should cycle thorugh the routes. Note that if all three `front`, `side`, and `back` folders of a group is empty, the group will be skipped.

### Example SD Card File Structure
```
root
├───global_settings.txt
├───0
│   ├───image_settings.txt
│   ├───front
│   │   ├───KMB-74X-00.bmp
│   │   └───KMB-74X-01.bmp
│   ├───side
│   │   └───KMB-74X-10.bmp
│   └───back
│       └───KMB-74X-20.bmp
├───1
│   ├───image_settings.txt
│   ├───front
│   │   ├───KMB-680-00.bmp
│   │   ├───KMB-680-01.bmp
│   │   └───KMB-680-02.bmp
│   ├───side
│   │   ├───KMB-680-10.bmp
│   │   └───KMB-680-11.bmp
│   └───back
│       ├───KMB-680-20.bmp
│       └───KMB-680-21.bmp
...
└───9
    ├───image_settings.txt
    ├───front
    │   └───KMB-special-00.bmp
    ├───side
    └───back
```

## Configuration
There are two types of settings that can be configured by the user. All fields accept positive integers. If a corrupted settings file is detected, it will be reset to its default values.

### Global Settings
These settings control the display animation as a whole. The configuration file, `global_settings.txt`, is in the root of the SD card.

The contents of `global_settings.txt` with its default values are shown below.
```
scroll_animation=1
switch_delay=2
```
Parameter | Description
--- | ---
`scroll_animation` | Defines whether a scrolling animation will be used when switching between images. The scrolling animation simulates flip dot displays.<br>`scroll_animation=0`: No scrolling animation<br>`scroll_animation=1`: Scrolling animation
`switch_delay` | The amount of time (in seconds) to show each image before switching to the next one.<br>Note: The actual time might be greater than the number specified here depending on the time it takes to load the next image.

### Image Settings
These settings control the way images are scaled or cropped. The configuration file, `image_settings.txt`, is inside each of the ten folders `0` to `9` on the SD card.

"Scale" refers to how many pixels (in one axis) on the BMP image maps to one pixel (in one axis) on the physical display. For example, a scale of 3 means that every 3x3 square on the BMP image corresponds to one pixel on the physical display.

"Crop" refers to how many pixels (symmetrical on all sides) of the BMP image will not be shown on the physical display.

The contents of `image_settings.txt` with its default values are shown below.
```
front_scale=3
front_crop=20
side_scale=3
side_crop=19
back_scale=1
back_crop=0
```
Parameter | Description
--- | ---
`front_scale` | The scaling of the images on the front display.
`front_crop` | The crop of the images on the front display.
`side_scale` | The scaling of the images on the side display.
`side_crop` | The crop of the images on the side display.
`back_scale` | The scaling of the images on the back display.
`back_crop` | The crop of the images on the back display.

## Troubleshooting
* My images are not showing up!
  * Make sure the images are in BMP format. (8, 16, 24, and 32-bit uncompressed BMP files are supported.)
  * Make sure the BMP files are in any of the three folders (front, side, or back). They shouldn't be anywhere else or nested inside those folders.
  * Make sure the image crop value is low enough that at least a part of the image is still visible.
* My images take forever to load!
  * Keep the image sizes small, preferably smaller than 500x500 pixels.
  * Images will load slower for the first time as the cache is being created.
* My SD card failed to initalize!
  * Make sure the SD card is formatted to FAT32.
  * Make sure the SD card is clean, inserted fully into the SD card slot, and oriented in the correct direction.
