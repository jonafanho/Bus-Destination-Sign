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
import {CardModule} from "primeng/card";

@Component({
	selector: "app-edit-image",
	imports: [
		ButtonModule,
		SliderModule,
		CardModule,
		TooltipModule,
		FormsModule,
		ReactiveFormsModule,
		DialogComponent,
		DragPointComponent,
		InputNumberWithSliderComponent,
		TranslocoDirective,
	],
	templateUrl: "./edit-image.component.html",
	styleUrls: ["./edit-image.component.css"],
})
export class EditImageComponent {
	private readonly displayService = inject(DisplayService);

	@Input({required: true}) displayIndex!: number;
	visible = model<boolean>(false);
	protected readonly formGroup;
	protected imageWidth = 0;
	protected imageHeight = 0;
	protected displayWidth = 0;
	protected displayHeight = 0;

	protected readonly minScale = 1;
	protected readonly maxScale = 8;
	protected readonly minContrast = 1;
	protected readonly maxContrast = 0xFF;
	protected readonly averageContrast = 0x7F;

	protected zoom1 = 1;
	protected zoom2 = 1;
	protected readonly minZoom = 0.25;
	protected readonly maxZoom = 16;
	protected readonly dragPoints = [{x: 0, y: 0, tooltip: "tooltip.top-left-pixel"}, {x: 0, y: 0, tooltip: "tooltip.top-left-pixel-offset"}, {x: 0, y: 0, tooltip: "tooltip.bottom-right-pixel"}];

	private imageIndex = -1;
	private readonly imageElement = document.createElement("img");
	private readonly tempCanvas = document.createElement("canvas");
	private readonly tempCanvasContext = this.tempCanvas.getContext("2d", {willReadFrequently: true});

	constructor() {
		const formBuilder = inject(FormBuilder);

		this.formGroup = formBuilder.group({
			editContrast: new FormControl(0),
			editScale: new FormControl(0),
			wipeDuration: new FormControl(0),
			width: new FormControl(0),
			scrollLeftAnchor: new FormControl(0),
			scrollRightAnchor: new FormControl(0),
		});

		this.formGroup.valueChanges.subscribe(() => this.updateCanvasAndSave());
	}

	updateForm(imageIndex: number) {
		this.imageIndex = imageIndex;
		const display = this.getDisplay();
		this.displayWidth = getDisplayTypeWidth(display.displayType);
		this.displayHeight = getDisplayTypeHeight(display.displayType);
		const displayImage = this.getDisplayImage();

		if (displayImage) {
			this.formGroup.get("editContrast")?.setValue(clamp(displayImage.editContrast === 0 ? this.averageContrast : displayImage.editContrast, this.minContrast, this.maxContrast));
			this.formGroup.get("editScale")?.setValue(clamp(displayImage.editScale, this.minScale, this.maxScale));
			this.formGroup.get("wipeDuration")?.setValue(displayImage.wipeDuration);
			this.formGroup.get("width")?.setValue(displayImage.width);
			this.formGroup.get("scrollLeftAnchor")?.setValue(displayImage.scrollLeftAnchor);
			this.formGroup.get("scrollRightAnchor")?.setValue(displayImage.scrollRightAnchor);

			this.imageElement.crossOrigin = "anonymous";
			this.imageElement.src = this.getImageUrl() ?? "";
			this.imageElement.onload = () => {
				this.imageWidth = this.imageElement.width;
				this.imageHeight = this.imageElement.height;
				this.tempCanvas.width = this.imageWidth;
				this.tempCanvas.height = this.imageHeight;
				this.tempCanvasContext?.drawImage(this.imageElement, 0, 0);
				this.dragPoints[0].x = displayImage.editTopLeftPixelX;
				this.dragPoints[0].y = displayImage.editTopLeftPixelY;
				this.dragPoints[1].x = displayImage.editTopLeftOffsetPixelX === 0 ? Math.min(Math.floor(this.imageWidth / 2), 8) : displayImage.editTopLeftOffsetPixelX;
				this.dragPoints[1].y = displayImage.editTopLeftOffsetPixelY === 0 ? Math.min(Math.floor(this.imageHeight / 2), 8) : displayImage.editTopLeftOffsetPixelY;
				this.dragPoints[2].x = displayImage.editBottomRightPixelX === 0 ? this.imageWidth : displayImage.editBottomRightPixelX;
				this.dragPoints[2].y = displayImage.editBottomRightPixelY === 0 ? this.imageHeight : displayImage.editBottomRightPixelY;
				this.updateCanvasAndSave();
			};
		}
	}

	getImageUrl() {
		const rawImageId = this.getDisplayImage()?.rawImageId;
		return rawImageId ? `${getUrl()}api/getRawImage/${rawImageId}` : undefined;
	}

	changeZoom1(amount: number) {
		this.zoom1 = clamp(this.zoom1 + amount, this.minZoom, this.maxZoom);
	}

	changeZoom2(amount: number) {
		this.zoom2 = clamp(this.zoom2 + amount, this.minZoom, this.maxZoom);
	}

	updateCanvasAndSave() {
		const canvas = document.getElementById("canvas") as HTMLCanvasElement;
		const displayImage = this.getDisplayImage();
		const context = canvas?.getContext("2d");

		if (displayImage && context && this.tempCanvasContext) {
			const data = this.formGroup.getRawValue();
			const editScale = clamp(data.editScale ?? this.minScale, this.minScale, this.maxScale);
			const editContrast = clamp(data.editContrast ?? this.averageContrast, this.minContrast, this.maxContrast);

			context.fillStyle = "black";
			context.fillRect(0, 0, canvas.width, canvas.height);
			context.fillStyle = "white";

			const pixelWidth = Math.max(1, Math.abs(this.dragPoints[1].x - this.dragPoints[0].x));
			const pixelHeight = Math.max(1, Math.abs(this.dragPoints[1].y - this.dragPoints[0].y));
			const pixelCountX = Math.round(Math.abs(this.dragPoints[2].x - this.dragPoints[0].x) / pixelWidth) + 1;
			const pixelCountY = Math.round(Math.abs(this.dragPoints[2].y - this.dragPoints[0].y) / pixelHeight) + 1;
			const offsetX = Math.round((this.displayWidth - pixelCountX * editScale) / 2);
			const offsetY = Math.round((this.displayHeight - pixelCountY * editScale) / 2);
			const editedImageBytes: number[] = new Array(Math.round(this.displayWidth * this.displayHeight / 8)).fill(0);

			for (let x = 0; x < pixelCountX; x++) {
				for (let y = 0; y < pixelCountY; y++) {
					const pixelX = offsetX + x * editScale;
					const pixelY = offsetY + y * editScale;
					if (pixelX + editScale > 0 && pixelY + editScale > 0 && pixelX < this.displayWidth && pixelY < this.displayHeight) {
						const [r, g, b] = this.tempCanvasContext.getImageData(this.dragPoints[0].x + x * pixelWidth, this.dragPoints[0].y + y * pixelHeight, 1, 1).data;
						if ((r + g + b) / 3 > editContrast) {
							context.fillRect(pixelX, pixelY, editScale, editScale);
							editedImageBytes[Math.floor(pixelY / 8) * this.displayWidth + pixelX] |= 1 << (pixelX % 8);
						}
					}
				}
			}

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
				wipeDuration: data.wipeDuration ?? 0,
				width: data.width ?? 0,
				scrollLeftAnchor: data.scrollLeftAnchor ?? 0,
				scrollRightAnchor: data.scrollRightAnchor ?? 0,
			};

			this.displayService.saveDisplays();
		}
	}

	private getDisplay() {
		return this.displayService.getData()[this.displayIndex];
	}

	private getDisplayImage() {
		const display = this.getDisplay();
		return display && display.displayImages ? display.displayImages[this.imageIndex] : undefined;
	}
}
