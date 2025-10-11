export interface DisplayImage {
	readonly rawImageId: string;
	readonly editPixelX: number;
	readonly editPixelY: number;
	readonly editPixelCountX: number;
	readonly editPixelCountY: number;
	readonly editedImageBytes: number[];
	readonly wipeDuration: number;
	readonly width: number;
	readonly scrollLeftAnchor: number;
	readonly scrollRightAnchor: number;
}
