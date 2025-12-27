import {Component, inject, Input, model} from "@angular/core";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TooltipModule} from "primeng/tooltip";
import {DisplayService} from "../../service/display.service";
import {clamp, getUrl} from "../../utility/utilities";
import {TranslocoDirective} from "@jsverse/transloco";
import {SliderModule} from "primeng/slider";
import {InputNumberWithSliderComponent} from "../input-number-with-slider/input-number-with-slider.component";
import {getDisplayTypeHeight, getDisplayTypeWidth} from "../../type/display-type";
import {DialogComponent} from "../dialog/dialog.component";
import {ButtonModule} from "primeng/button";
import {DragPointComponent} from "../drag-point/drag-point.component";
import {DividerModule} from "primeng/divider";
import {CheckboxModule} from "primeng/checkbox";
import {DialogService} from "../../service/dialog.service";

const imageBufferWidth = 512;
const imageBufferSize = imageBufferWidth * 64 / 8;

@Component({
	selector: "app-edit-image",
	imports: [
		ButtonModule,
		SliderModule,
		TooltipModule,
		FormsModule,
		DividerModule,
		CheckboxModule,
		ReactiveFormsModule,
		DialogComponent,
		DragPointComponent,
		InputNumberWithSliderComponent,
		TranslocoDirective,
	],
	templateUrl: "./edit-image.component.html",
	styleUrls: ["./edit-image.component.scss"],
})
export class EditImageComponent {
	private readonly displayService = inject(DisplayService);
	private readonly dialogService = inject(DialogService);

	@Input({required: true}) displayIndex!: number;
	visible = model<boolean>(false);
	protected readonly formGroup;
	protected imageWidth = 0;
	protected imageHeight = 0;
	protected displayWidth = 0;
	protected displayHeight = 0;

	protected readonly minContrast = 1;
	protected readonly maxContrast = 0xFF;
	protected readonly defaultContrast = 0x7F;
	protected readonly minScale = 1;
	protected readonly maxScale = 8;
	protected readonly minDisplayDuration = 1;
	protected readonly maxDisplayDuration = 30000;
	protected readonly defaultDisplayDuration = 2000;
	protected readonly minWipeSpeed = 1;
	protected readonly maxWipeSpeed = 500;
	protected readonly defaultWipeSpeed = 10;

	protected zoom = 1;
	protected readonly minZoom = 0.25;
	protected readonly maxZoom = 16;
	protected readonly dragPoints = [
		{x: 0, y: 0, isBar: false, visible: true, tooltip: "tooltip.top-left-pixel"},
		{x: 0, y: 0, isBar: false, visible: true, tooltip: "tooltip.top-left-pixel-offset"},
		{x: 0, y: 0, isBar: false, visible: true, tooltip: "tooltip.bottom-right-pixel"},
		{x: 0, y: 0, isBar: true, visible: false, tooltip: "tooltip.scroll-left-anchor"},
		{x: 0, y: 0, isBar: true, visible: false, tooltip: "tooltip.scroll-right-anchor"},
	];

	private imageIndex = -1;
	private readonly imageElement = document.createElement("img");
	private readonly tempCanvas = document.createElement("canvas");
	private readonly tempCanvasContext = this.tempCanvas.getContext("2d", {willReadFrequently: true});
	private readonly imagePixels: number[][] = [];

	constructor() {
		const formBuilder = inject(FormBuilder);

		this.formGroup = formBuilder.group({
			editContrast: new FormControl(0),
			editScale: new FormControl(0),
			displayDuration: new FormControl(0),
			hasWipe: new FormControl(false),
			wipeSpeed: new FormControl(0),
			hasScroll: new FormControl(false),
		});

		this.formGroup.valueChanges.subscribe(() => this.updateCanvasAndSave());

		const updateCanvas = () => requestAnimationFrame(millis => {
			const context = (document.getElementById("canvas") as HTMLCanvasElement)?.getContext("2d");

			if (context && this.displayWidth > 0 && this.displayHeight > 0) {
				const imageData = context.createImageData(this.displayWidth, this.displayHeight);
				for (let i = 0; i < imageData.data.length; i += 4) {
					imageData.data[i] = 0;
					imageData.data[i + 1] = 0;
					imageData.data[i + 2] = 0;
					imageData.data[i + 3] = 0xFF;
				}
				this.iteratePixels((x, y, filled) => {
					const {
						editScale,
						hasScroll,
						scrollLeftAnchor,
						scrollRightAnchor,
						outputImageWidth,
					} = this.getAllSettings();
					const addPixel = (offsetX: number) => {
						const index = x + offsetX + y * this.displayWidth;
						imageData.data[index * 4] = filled ? 0xFF : 0;
						imageData.data[index * 4 + 1] = filled ? 0xFF : 0;
						imageData.data[index * 4 + 2] = filled ? 0xFF : 0;
						imageData.data[index * 4 + 3] = 0xFF;
					};

					if (hasScroll) {
						const scrollWidth = outputImageWidth - (scrollLeftAnchor + scrollRightAnchor) * editScale;
						const actualScrollWidth = this.displayWidth - (scrollLeftAnchor + scrollRightAnchor) * editScale;
						if (x < scrollLeftAnchor * editScale) {
							addPixel(0);
						} else if (x >= outputImageWidth - scrollRightAnchor * editScale) {
							addPixel(actualScrollWidth - scrollWidth);
						} else {
							const animationProgress = Math.round((millis / 20) % (scrollWidth + actualScrollWidth));
							const offsetX = actualScrollWidth - animationProgress;
							if (x + offsetX >= scrollLeftAnchor * editScale && x + offsetX < this.displayWidth - scrollRightAnchor * editScale) {
								addPixel(offsetX);
							}
						}
					} else {
						addPixel(0);
					}
				});
				context.putImageData(imageData, 0, 0);
			}

			if (this.visible()) {
				updateCanvas();
			}
		});

		this.dialogService.openEditImageDialog.subscribe(() => updateCanvas());
	}

	updateForm(imageIndex: number) {
		this.imageIndex = imageIndex;
		const display = this.getDisplay();
		this.displayWidth = getDisplayTypeWidth(display.displayType);
		this.displayHeight = getDisplayTypeHeight(display.displayType);
		const displayImage = this.getDisplayImage();

		if (displayImage) {
			this.formGroup.get("editContrast")?.setValue(clamp(displayImage.editContrast === 0 ? this.defaultContrast : displayImage.editContrast, this.minContrast, this.maxContrast));
			const editScale = clamp(displayImage.editScale, this.minScale, this.maxScale);
			this.formGroup.get("editScale")?.setValue(editScale);
			this.formGroup.get("displayDuration")?.setValue(clamp(displayImage.displayDuration === 0 ? this.defaultDisplayDuration : displayImage.displayDuration, this.minDisplayDuration, this.maxDisplayDuration));
			this.formGroup.get("hasWipe")?.setValue(displayImage.wipeSpeed > 0);
			this.formGroup.get("wipeSpeed")?.setValue(clamp(displayImage.wipeSpeed === 0 ? this.defaultWipeSpeed : displayImage.wipeSpeed, 0, this.maxWipeSpeed));
			const hasScroll = displayImage.width > 0;
			this.formGroup.get("hasScroll")?.setValue(hasScroll);

			this.imageElement.crossOrigin = "anonymous";
			this.imageElement.src = this.getImageUrl() ?? "";
			this.imageElement.onload = () => {
				this.imageWidth = this.imageElement.width;
				this.imageHeight = this.imageElement.height;

				this.tempCanvas.width = this.imageWidth;
				this.tempCanvas.height = this.imageHeight;
				this.tempCanvasContext?.drawImage(this.imageElement, 0, 0);
				this.imagePixels.length = 0;
				const rawPixels = this.tempCanvasContext ? this.tempCanvasContext.getImageData(0, 0, this.imageWidth, this.imageHeight).data : [];

				for (let x = 0; x < this.imageWidth; x++) {
					const row: number[] = [];
					this.imagePixels.push(row);
					for (let y = 0; y < this.imageWidth; y++) {
						const index = x + y * this.imageWidth;
						row.push(Math.floor((rawPixels[index * 4] + rawPixels[index * 4 + 1] + rawPixels[index * 4 + 2]) / 3));
					}
				}

				this.dragPoints[0].x = displayImage.editTopLeftPixelX;
				this.dragPoints[0].y = displayImage.editTopLeftPixelY;
				this.dragPoints[1].x = displayImage.editTopLeftOffsetPixelX === 0 ? Math.min(Math.floor(this.imageWidth / 2), 8) : displayImage.editTopLeftOffsetPixelX;
				this.dragPoints[1].y = displayImage.editTopLeftOffsetPixelY === 0 ? Math.min(Math.floor(this.imageHeight / 2), 8) : displayImage.editTopLeftOffsetPixelY;
				this.dragPoints[2].x = displayImage.editBottomRightPixelX === 0 ? this.imageWidth : displayImage.editBottomRightPixelX;
				this.dragPoints[2].y = displayImage.editBottomRightPixelY === 0 ? this.imageHeight : displayImage.editBottomRightPixelY;

				const pixelWidth = Math.max(1, Math.abs(this.dragPoints[1].x - this.dragPoints[0].x));
				this.dragPoints[3].visible = hasScroll;
				this.dragPoints[3].x = clamp(displayImage.editTopLeftPixelX + (displayImage.scrollLeftAnchor / editScale - 0.5) * pixelWidth, 0, this.imageWidth - 1);
				this.dragPoints[4].visible = hasScroll;
				this.dragPoints[4].x = displayImage.scrollRightAnchor === 0 ? this.imageWidth - 1 : clamp(displayImage.editBottomRightPixelX - (displayImage.scrollRightAnchor / editScale - 0.5) * pixelWidth, 0, this.imageWidth - 1);

				this.zoom = clamp(displayImage.width / this.displayWidth, this.minZoom, this.maxZoom);
				this.updateCanvasAndSave();
			};
		}
	}

	getImageUrl() {
		const rawImageId = this.getDisplayImage()?.rawImageId;
		return rawImageId ? `${getUrl()}api/getRawImage/${rawImageId}` : undefined;
	}

	changeZoom(amount: number) {
		this.zoom = clamp(this.zoom + amount, this.minZoom, this.maxZoom);
	}

	updateCanvasAndSave() {
		const displayImage = this.getDisplayImage();

		if (displayImage && this.tempCanvasContext) {
			// Update and clean form values
			const {
				editContrast,
				editScale,
				displayDuration,
				wipeSpeed,
				pixelCountX,
				scrollLeftAnchor,
				scrollRightAnchor,
			} = this.getAllSettings();
			const data = this.formGroup.getRawValue();

			// Update disable states
			if (data.hasWipe && this.formGroup.get("wipeSpeed")?.disabled) {
				this.formGroup.get("wipeSpeed")?.enable();
				this.formGroup.get("wipeSpeed")?.setValue(wipeSpeed);
			} else if (!data.hasWipe && this.formGroup.get("wipeSpeed")?.enabled) {
				this.formGroup.get("wipeSpeed")?.disable();
			}

			// Update scroll drag bars
			this.dragPoints[3].visible = data.hasScroll === true;
			this.dragPoints[4].visible = data.hasScroll === true;

			// Write edited image bytes
			const editedImageBytes: number[] = new Array(imageBufferSize).fill(0);
			this.iteratePixels((x, y, filled) => {
				if (filled) {
					editedImageBytes[x + Math.floor(y / 8) * imageBufferWidth] |= 1 << (y % 8);
				}
			});

			// Update display image object
			this.getDisplay().displayImages[this.imageIndex] = {
				rawImageId: displayImage.rawImageId,
				editTopLeftPixelX: this.dragPoints[0].x,
				editTopLeftPixelY: this.dragPoints[0].y,
				editTopLeftOffsetPixelX: this.dragPoints[1].x,
				editTopLeftOffsetPixelY: this.dragPoints[1].y,
				editBottomRightPixelX: this.dragPoints[2].x,
				editBottomRightPixelY: this.dragPoints[2].y,
				editContrast,
				editScale,
				editedImageBytes,
				displayDuration,
				wipeSpeed,
				width: data.hasScroll ? pixelCountX * editScale : 0,
				scrollLeftAnchor: scrollLeftAnchor * editScale,
				scrollRightAnchor: scrollRightAnchor * editScale,
			};

			// Save
			this.displayService.saveDisplays();
		}
	}

	private getDisplay() {
		return this.displayService.data()[this.displayIndex];
	}

	private getDisplayImage() {
		const display = this.getDisplay();
		return display && display.displayImages ? display.displayImages[this.imageIndex] : undefined;
	}

	private getAllSettings() {
		const data = this.formGroup.getRawValue();
		const editContrast = clamp(data.editContrast ?? this.defaultContrast, this.minContrast, this.maxContrast);
		const editScale = clamp(data.editScale ?? this.minScale, this.minScale, this.maxScale);
		const displayDuration = clamp(data.displayDuration ?? this.defaultDisplayDuration, this.minDisplayDuration, this.maxDisplayDuration);
		const wipeSpeed = data.hasWipe ? clamp(data.wipeSpeed ?? this.defaultWipeSpeed, this.minWipeSpeed, this.maxWipeSpeed) : 0;
		const pixelWidth = Math.max(1, Math.abs(this.dragPoints[1].x - this.dragPoints[0].x));
		const pixelHeight = Math.max(1, Math.abs(this.dragPoints[1].y - this.dragPoints[0].y));
		const pixelCountX = Math.round(Math.abs(this.dragPoints[2].x - this.dragPoints[0].x) / pixelWidth) + 1;
		const pixelCountY = Math.round(Math.abs(this.dragPoints[2].y - this.dragPoints[0].y) / pixelHeight) + 1;
		const hasScroll = data.hasScroll === true;
		const scrollLeftAnchor = clamp(Math.round((this.dragPoints[3].x - this.dragPoints[0].x) / pixelWidth), 0, this.displayWidth);
		const scrollRightAnchor = clamp(Math.round((this.dragPoints[2].x - this.dragPoints[4].x + 1) / pixelWidth), 0, this.displayWidth);
		const outputImageWidth = hasScroll ? Math.min(imageBufferWidth, pixelCountX * editScale) : this.displayWidth;
		return {
			editContrast,
			editScale,
			displayDuration,
			wipeSpeed,
			pixelWidth,
			pixelHeight,
			pixelCountX,
			pixelCountY,
			hasScroll,
			scrollLeftAnchor,
			scrollRightAnchor,
			outputImageWidth,
		};
	}

	private iteratePixels(callback: (x: number, y: number, filled: boolean) => void) {
		const {
			editContrast,
			editScale,
			pixelWidth,
			pixelHeight,
			pixelCountX,
			pixelCountY,
			hasScroll,
			outputImageWidth,
		} = this.getAllSettings();
		const offsetX = hasScroll ? 0 : Math.round((this.displayWidth - pixelCountX * editScale) / 2);
		const offsetY = Math.round((this.displayHeight - pixelCountY * editScale) / 2);

		for (let x = 0; x < pixelCountX; x++) {
			for (let y = 0; y < pixelCountY; y++) {
				const pixelX = offsetX + x * editScale;
				const pixelY = offsetY + y * editScale;
				if (pixelX + editScale > 0 && pixelY + editScale > 0 && pixelX < outputImageWidth && pixelY < this.displayHeight) {
					const filled = ((this.imagePixels[this.dragPoints[0].x + x * pixelWidth] ?? [])[this.dragPoints[0].y + y * pixelHeight] ?? 0) > editContrast;
					for (let i = 0; i < editScale; i++) {
						for (let j = 0; j < editScale; j++) {
							const newPixelX = pixelX + i;
							const newPixelY = pixelY + j;
							if (newPixelX >= 0 && newPixelX < outputImageWidth && newPixelY >= 0 && newPixelY < this.displayHeight) {
								callback(newPixelX, newPixelY, filled);
							}
						}
					}
				}
			}
		}
	}
}
