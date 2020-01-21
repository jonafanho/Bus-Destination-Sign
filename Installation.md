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
Micro USB cable | 1 | This is a tool. Only one is needed to create many sets.

### Preparing the STM32 Microcontroller
Before any programs can be uploaded to the microcontroller through a USB connection, a bootloader must be flashed onto the device.

Connect the USB to TTL device to the microcontroller as follows. Double check the connections before proceeding!

USB to TTL Pin | STM32 Pin
--- | ---
GND | GND
3.3V | 3.3V
RX | A9
TX | A10

Next, the bootloader will need to be flashed onto the microcontroller. For Windows users, there is an additional driver that needs to be installed. Complete the [Preparing the Environment](#preparing-the-environment) section before continuing.
1. There are two yellow rectangles sticking out of the STM32 board; they are jumper pins.
   1. Find the jumper pin labelled `BOOT0` and move it to `1` (programming mode).
   1. The other jumper pin, labelled `BOOT1`, should stay at `0`.
1. Download and install [Python 3](https://www.python.org/downloads) if it is not already installed.
1. Download pip if it is not already installed.
   1. Download [this installation file](https://bootstrap.pypa.io/get-pip.py). It should be called `get-pip.py`. Leave it in the Downloads folder.
   1. Double click on the file `get-pip.py` to run it. If that doesn't work, open a Terminal or Command Prompt window and run the command `python ~/Downloads/get-pip.py`.
1. Open a Terminal or Command Prompt window and run the command `pip install pyserial`.
1. Download the [stm32loader Python script](https://github.com/jsnyder/stm32loader). The file should be called `stm32loader.py`. Leave it in the Downloads folder.
1. Double click on `stm32loader.py` to run it. If that doesn't work, open a Terminal or Command Prompt window and run the command `python ~/Downloads/stm32loader.py`.
1. Download the bootloader from [this GitHub repository](https://github.com/rogerclarkmelbourne/STM32duino-bootloader/blob/master/binaries/generic_boot20_pc13.bin). It should be a `.bin` file. Leave it in the Downloads folder. *(Note: Check that the STM32 has its on-board LED connected to pin PC13. If it is not, search for other bootloaders in that repository.)*
1. Plug in the USB to TTL device into the computer. It should also already be connected to the STM32 microcontroller as instructed above.
1. In the Terminal or Command Prompt window, run the command `python ./stm32loader -p /dev/tty.SLAB_USBtoUART -w ~/Downloads/generic_boot20_pc13.bin`.
1. The reset button on the STM32 board might need to be pressed before the above command can work. If the process is successful, the LED should flash quickly after pressing reset and then flash slowly afterwards.
1. Move both yellow jumper pins on the STM32 board back to `0` and disconnect everything.  

### Custom PCB
A custom PCB is not strictly required as the whole circuit can be built on a breadboard or a protoboard. However, a PCB design and schematic is provided in this repository.
1. *(Coming soon!)*

### Assembly
The displays and the SD card reader needs to be wired up to the STM32. In the following tables, the pins shown on the left (or centre) column need to be wired up to the corresponding pins shown on the right column.

It is essential that the correct pins are connected together. Double and triple check all the connections!

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
1. (Windows users only)
   1. Navigate to `C:\Program Files (x86)\Arduino` (or wherever Arduino was installed).
   1. Open the `hardware` folder or create it if it doesn't exist.
   1. Download [this repository](https://github.com/rogerclarkmelbourne/Arduino_STM32). Click the green `Clone or download` button and `Download Zip`.
   1. Open the zip file. Copy the folder `Arduino_STM32-master` to the `hardware` folder. Rename the folder to `Arduino_STM32` (get rid of `-master`).
   1. Close the zip file. Open the newly copied `Arduino_STM32` folder. Inside the `drivers` folder, find `install_drivers.bat`.
   1. Double click on `install_drivers.bat` and keep typing `yes` when prompted.

### Installing Libraries
Several libraries are required by the software. They can be installed right from the Arduino IDE.
1. Go to `Sketch` | `Include Library` | `Manage Libraries`.
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

### Using the code
1. Clone or download this repository.
1. Double click on `Display.ino` to open it. It should open in the Arduino IDE by default.
1. Make changes to the code as needed, for example, if you have [custom OLED displays](#custom-oled-displays).
1. Connect the STM32 to the computer using a Micro USB cable.
1. Press the upload icon in the Arduino IDE to uplaod the code to the STM32 microcontroller.

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
