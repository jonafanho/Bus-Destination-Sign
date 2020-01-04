# Installation
This guide contains instructions on how to build the whole system from scratch, as well as steps to build and flash the software. Installation consists of two parts, [hardware](#Hardware-Setup) and [software](#Software-Setup).

## Hardware Setup
### Materials
Item | Quantity | Notes
--- | ---:| ---
SSD1322 OLED display with SPI connection | 2 | Any size is fine.<br>The communication protocol must be SPI.<br>Can be susbstituted with other OLED displays. See the [Custom OLED Displays](#Custom-OLED-Displays) section for instructions.
SH1106 OLED display with SPI connection | 1 | Any size is fine.<br>The communication protocol must be SPI.<br>Can be susbstituted with other OLED displays. See the [Custom OLED Displays](#Custom-OLED-Displays) section for instructions.
Female to female jumper cables | 40 | Order more just in case.
STM32 Blue Pill | 1 | A better Arduino.
SD card reader | 1 |
LM7805 voltage regulators | 1 |
Custom PCB | 1 | The PCB design is packaged in this repository. See the [Custom PCB](#Custom-PCB) section for instructions.
USB to TTL | 1 | This is a tool. Only one is needed to create many sets.

### Custom PCB
A custom PCB is not strictly required as the whole circuit can be built on a breadboard or a protoboard. However, a PCB design and schematic is provided in this repository.
1.

### Assembly
#### SSD1322 Display Pinout
Pin | Function
---:| ---
1 | GND
2 | 3.3V
4 | CLK
5 | MOSI
14 | DC
15 | RES
16 | CS

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
1.

### Required Miscellaneous Steps
1. Go to the SPI library directory and force the code to use the second SPI channel.
   1. Add `spi_num = 2;` to SPI.cpp.
1. Go to the SdFat library (Adafruit fork) directory.
   1. Enable software SPI. Set `#define ENABLE_SOFTWARE_SPI_CLASS` to `1` in SdFatConfig.h.
   1. Change the second argument's datatype to `WiringPinMode` instead of `uint8_t` of the `inline void fastPinMode()` function in SpiDriver/DigitalPin.h.

### Custom OLED Displays
