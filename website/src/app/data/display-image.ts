export interface DisplayImage {
	readonly rawImageId: string;
	readonly startOfNewGroup: boolean;
	readonly editTopLeftPixelX: number;
	readonly editTopLeftPixelY: number;
	readonly editTopLeftOffsetPixelX: number;
	readonly editTopLeftOffsetPixelY: number;
	readonly editBottomRightPixelX: number;
	readonly editBottomRightPixelY: number;
	readonly editContrast: number;
	readonly editScale: number;
	readonly editedImageBytes: number[];
	readonly displayDuration: number;
	readonly wipeSpeed: number;
	readonly width: number;
	readonly scrollLeftAnchor: number;
	readonly scrollRightAnchor: number;
}
