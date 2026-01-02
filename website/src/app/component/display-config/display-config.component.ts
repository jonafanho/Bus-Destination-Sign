import {Component, inject, Input} from "@angular/core";
import {ButtonModule} from "primeng/button";
import {TranslocoDirective} from "@jsverse/transloco";
import {CardModule} from "primeng/card";
import {SelectModule} from "primeng/select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputNumberModule} from "primeng/inputnumber";
import {FloatLabelModule} from "primeng/floatlabel";
import {TooltipModule} from "primeng/tooltip";
import {PanelModule} from "primeng/panel";
import {MessageModule} from "primeng/message";
import {DividerModule} from "primeng/divider";
import {FileUploadModule} from "primeng/fileupload";
import {DisplayService} from "../../service/display.service";
import {DisplaySettingsComponent} from "../display-settings/display-settings.component";
import {clamp, getUrl} from "../../utility/utilities";
import {getDisplayTypeName} from "../../type/display-type";
import {ImageGalleryComponent} from "../image-gallery/image-gallery.component";
import {EditImageComponent} from "../edit-image/edit-image.component";
import {DialogComponent} from "../dialog/dialog.component";
import {DialogService} from "../../service/dialog.service";

@Component({
	selector: "app-display-config",
	imports: [
		CardModule,
		SelectModule,
		InputNumberModule,
		PanelModule,
		ButtonModule,
		FloatLabelModule,
		MessageModule,
		FileUploadModule,
		DividerModule,
		TooltipModule,
		DialogComponent,
		ImageGalleryComponent,
		EditImageComponent,
		DisplaySettingsComponent,
		TranslocoDirective,
		FormsModule,
		ReactiveFormsModule,
	],
	templateUrl: "./display-config.component.html",
	styleUrls: ["./display-config.component.scss"],
})
export class DisplayConfigComponent {
	private readonly displayService = inject(DisplayService);
	private readonly dialogService = inject(DialogService);

	@Input({required: true}) displayIndex!: number;
	protected readonly getDisplayTypeName = getDisplayTypeName;
	protected addImageDialogVisible = false;
	protected editImageDialogVisible = false;
	protected settingsDialogVisible = false;

	getDisplay() {
		return this.displayService.data()[this.displayIndex];
	}

	addImage(rawImageId: string, editImageComponent: EditImageComponent) {
		const existingDisplayImages = this.displayService.data()[this.displayIndex].displayImages;
		const lastDisplayImage = existingDisplayImages[existingDisplayImages.length - 1];
		this.getDisplay().displayImages.push({
			rawImageId,
			editTopLeftPixelX: lastDisplayImage?.editTopLeftPixelX ?? 0,
			editTopLeftPixelY: lastDisplayImage?.editTopLeftPixelY ?? 0,
			editTopLeftOffsetPixelX: lastDisplayImage?.editTopLeftOffsetPixelX ?? 0,
			editTopLeftOffsetPixelY: lastDisplayImage?.editTopLeftOffsetPixelY ?? 0,
			editBottomRightPixelX: lastDisplayImage?.editBottomRightPixelX ?? 0,
			editBottomRightPixelY: lastDisplayImage?.editBottomRightPixelY ?? 0,
			editContrast: lastDisplayImage?.editContrast ?? 0x80,
			editScale: lastDisplayImage?.editScale ?? 1,
			editedImageBytes: [],
			displayDuration: lastDisplayImage?.displayDuration ?? 0,
			wipeSpeed: lastDisplayImage?.wipeSpeed ?? 0,
			width: lastDisplayImage?.width ?? 0,
			scrollLeftAnchor: lastDisplayImage?.scrollLeftAnchor ?? 0,
			scrollRightAnchor: lastDisplayImage?.scrollRightAnchor ?? 0,
		});
		this.displayService.saveDisplays();
		this.addImageDialogVisible = false;
		this.editImage(this.getDisplay().displayImages.length - 1, editImageComponent);
	}

	editImage(imageIndex: number, editImageComponent: EditImageComponent) {
		this.editImageDialogVisible = true;
		this.dialogService.openEditImageDialog.emit();
		editImageComponent.updateForm(imageIndex);
	}

	moveImage(imageIndex: number, direction: number) {
		const displayImages = this.getDisplay().displayImages;
		const targetImageIndex = clamp(imageIndex + direction, 0, displayImages.length - 1);

		if (imageIndex !== targetImageIndex) {
			displayImages.splice(targetImageIndex, 0, displayImages.splice(imageIndex, 1)[0]);
			this.displayService.saveDisplays();
		}
	}

	deleteImage(imageIndex: number) {
		this.getDisplay().displayImages.splice(imageIndex, 1);
		this.displayService.saveDisplays();
	}

	getUrlFromRawImageId(rawImageId: string) {
		return `${getUrl()}api/getRawImage/${rawImageId}`;
	}

	openRawImageManager() {
		this.addImageDialogVisible = false;
		this.dialogService.openRawImageManagerDialog.emit();
	}
}
