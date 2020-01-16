# Installation
This guide contains instructions on how to build the whole system from scratch, as well as steps to build and flash the software. Installation consists of two parts, [hardware](#hardware-Setup) and [software](#software-Setup).

## Hardware Setup
### Materials
Item | Quantity | Notes
--- | ---:| ---
SSD1322 OLED display with SPI connection | 2 | Any size is fine.<br>The communication protocol must be SPI.<br>Can be susbstituted with other OLED displays. See the [Custom OLED Displays](#custom-oled-displays) section for instructions.
SH1106 OLED display with SPI connection | 1 | Any size is fine.<br>The communication protocol must be SPI.<br>Can be susbstituted with other OLED displays. See the [Custom OLED Displays](#custom-oled-displays) section for instructions.
Female to female jumper cables | 40 | Order more just in case.
STM32 Blue Pill | 1 | A better Arduino.
SD card reader | 1 |
LM7805 voltage regulators | 1 |
Custom PCB | 1 | The PCB design is packaged in this repository. See the [Custom PCB](#custom-pcb) section for instructions.
USB to TTL | 1 | This is a tool. Only one is needed to create many sets.

### Custom PCB
A custom PCB is not strictly required as the whole circuit can be built on a breadboard or a protoboard. However, a PCB design and schematic is provided in this repository.
1. *(Coming soon!)*

### Assembly
The displays and the SD card reader needs to be wired up to the STM32. In the following tables, the pins shown on the left (or centre) column need to be wired up to the corresponding pins shown on the right column.

It is essential that the correct pins are connected together. Double and triple check your connections!

#### Displays
##### SSD1322 Display Pinout
Display Pin | Function | STM32 Pin
---:| --- | ---
1 | GND | GND
2 | 3.3V | 3.3V
4 | CLK | PB13
5 | MOSI | PB15
14 | DC | PA8
15 | RES | RST
16 | CS | [*(See note)*](#note-about-the-cs-pin)

##### SH1106 Display Pinout
Display Pin | Function | STM32 Pin
---:| --- | ---
1 | GND | GND
2 | 3.3V | 3.3V
3 | CLK | PB13
4 | MOSI | PB15
5 | RES | RST
6 | DC | PA8
7 | CS | [*(See note)*](#note-about-the-cs-pin)

##### Note About the CS Pin
The chip select (CS) pin will be different for each screen. It is used to by the microcontroller to control each display separately, despite the rest of the pins being connected together in parallel.

Display | STM32 Pin for CS
--- | ---
Front | PA9
Side | PA10
Back | PA11

#### SD Card Reader
SD Card Reader Pin | Function | STM32 Pin
---:| --- | ---
1 | GND | GND
2 | VCC | 3.3V
3 | MISO | PB9
4 | MOSI | PB4
5 | SCK | PB5
6 | CS |

## Software Setup
### Preparing the Environment
1. Download and install the [Arduino IDE](https://www.arduino.cc/en/Main/Software).
1. Inside the Arduino IDE, go to `File` | `Preferences`.
1. Paste the following link into the `Additional Boards Managers URLs` text box: `http://dan.drown.org/stm32duino/package_STM32duino_index.json`
1. Click `OK`.
1. Go to `Tools` | `Board: ...` | `Boards Manager`.
1. Select the entry containing `STM32F1xx/GD32F1xx boards` and click `Install`.
1. After the installation finishes, click `Close` to close the Boards Manager.
1. Select `Tools` | `Board: ...` | `Generic STM32F103C series` to use the STM32 board with the Arduino IDE.

### Installing Libraries
Several libraries are required by the software. They can be installed right from the Arduino IDE.
1. Go to `Sketch` | `Install Library` | `Manage Libraries`.
1. Search for the following libraries and click `Install` for each of them.
   1. `U8G2`
   1. `SdFat (Adafruit fork)`
1. After the above libraries are installed, close the Library Manager.

### Required Miscellaneous Steps
1. Go to the SPI library directory and force the code to use the second SPI channel.
   1. Add `spi_num = 2;` to SPI.cpp.
1. Go to the SdFat (Adafruit fork) library directory.
   1. Enable software SPI by setting `#define ENABLE_SOFTWARE_SPI_CLASS` to `1` in `SdFatConfig.h`.
   1. In the `inline void fastPinMode()` function in `SpiDriver/DigitalPin.h`, change the second argument's datatype to `WiringPinMode` instead of `uint8_t`.

### Custom OLED Displays
Custom OLED displays of different sizes or resolutions may be used. The communication protocol should be 4-wire SPI. The code must be changed if a different type of display or resolution is used.
1. Check for display compatibility in the [documentation of the U8G2 library](https://github.com/olikraus/u8g2/wiki/u8x8setupcpp). If the name of the display can be found, then it is compatible.
1. Obtain the class name from the constructor for the display. Use the 4-wire hardware SPI version (containing `4W_HW_SPI`).
1. In [`Display.ino`](https://github.com/jonafanho/Bus-Destination-Sign/blob/master/Display/Display.ino), replace the first three lines (below the `#include` statement) using the following template.
```
Core<DISPLAY_CLASS> front(DISPLAY_WIDTH, DISPLAY_HEIGHT, PA9, PA8);
Core<DISPLAY_CLASS> side(DISPLAY_WIDTH, DISPLAY_HEIGHT, PA10, PA8);
Core<DISPLAY_CLASS> back(DISPLAY_WIDTH, DISPLAY_HEIGHT, PA11, PA8);
```
Field | Description | Example Value
--- | --- | ---
`DISPLAY_CLASS` | The class name obtained above. | `U8X8_SSD1306_128X64_VCOMH0_4W_HW_SPI`
`DISPLAY_WIDTH` | The width of the display in pixels. | `128`
`DISPLAY_HEIGHT` | The height of the display in pixels. | `64`

#### Example
```
Core<U8X8_SSD1306_128X64_VCOMH0_4W_HW_SPI> front(128, 64, PA9, PA8);
```
