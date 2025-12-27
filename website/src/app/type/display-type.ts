export type DisplayType = "NONE" | "SSD1322" | "SH1106";

export function getDisplayTypeName(displayType: DisplayType) {
	switch (displayType) {
		case "SSD1322":
			return "SSD1322 (256×64)";
		case "SH1106":
			return "SH1106 (128×64)";
		default:
			return undefined;
	}
}

export function getDisplayTypeWidth(displayType: DisplayType) {
	switch (displayType) {
		case "SSD1322":
			return 256;
		case "SH1106":
			return 128;
		default:
			return 0;
	}
}

export function getDisplayTypeHeight(displayType: DisplayType) {
	switch (displayType) {
		case "SSD1322":
		case "SH1106":
			return 64;
		default:
			return 0;
	}
}
