export interface DisplayImage {
	readonly rawImageId: string;
	readonly editTopLeftPixelX: number;
	readonly editTopLeftPixelY: number;
	readonly editTopLeftOffsetPixelX: number;
	readonly editTopLeftOffsetPixelY: number;
	readonly editBottomRightPixelX: number;
	readonly editBottomRightPixelY: number;
	readonly editContrast: number;
	readonly editScale: number;
	readonly editedImageBytes: number[];
	readonly wipeDuration: number;
	readonly width: number;
	readonly scrollLeftAnchor: number;
	readonly scrollRightAnchor: number;
}
