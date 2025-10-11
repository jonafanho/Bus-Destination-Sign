import {Component, Input} from "@angular/core";
import {ButtonModule} from "primeng/button";
import {TranslocoDirective} from "@jsverse/transloco";
import {CardModule} from "primeng/card";
import {SelectModule} from "primeng/select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputNumberModule} from "primeng/inputnumber";
import {FloatLabelModule} from "primeng/floatlabel";
import {TooltipModule} from "primeng/tooltip";
import {DialogModule} from "primeng/dialog";
import {PanelModule} from "primeng/panel";
import {MessageModule} from "primeng/message";
import {DividerModule} from "primeng/divider";
import {FileUploadModule} from "primeng/fileupload";
import {DisplayService} from "../../service/display.service";
import {DisplaySettingsComponent} from "../display-settings/display-settings.component";
import {getUrl} from "../../utility/utilities";
import {ImageModule} from "primeng/image";
import {getDisplayTypeName} from "../../type/display-type";
import {ImageGalleryComponent} from "../image-gallery/image-gallery.component";
import {EditImageComponent} from "../edit-image/edit-image.component";

@Component({
	selector: "app-display-config",
	imports: [
		CardModule,
		SelectModule,
		InputNumberModule,
		PanelModule,
		ButtonModule,
		FloatLabelModule,
		ImageModule,
		MessageModule,
		DialogModule,
		FileUploadModule,
		DividerModule,
		TooltipModule,
		ImageGalleryComponent,
		EditImageComponent,
		DisplaySettingsComponent,
		TranslocoDirective,
		FormsModule,
		ReactiveFormsModule,
	],
	templateUrl: "./display-config.component.html",
	styleUrls: ["./display-config.component.css"],
})
export class DisplayConfigComponent {
	@Input({required: true}) displayIndex!: number;
	protected readonly getDisplayTypeName = getDisplayTypeName;
	protected addImageDialogVisible = false;
	protected editImageDialogVisible = false;
	protected settingsDialogVisible = false;

	constructor(private readonly displayService: DisplayService) {
	}

	getDisplay() {
		return this.displayService.getData()[this.displayIndex];
	}

	addImage(rawImageId: string, editImageComponent: EditImageComponent) {
		this.getDisplay().displayImages.push({
			rawImageId,
			editPixelX: 0,
			editPixelY: 0,
			editPixelCountX: 0,
			editPixelCountY: 0,
			editedImageBytes: [],
			wipeDuration: 0,
			width: 0,
			scrollLeftAnchor: 0,
			scrollRightAnchor: 0,
		});
		this.displayService.saveDisplays();
		this.addImageDialogVisible = false;
		this.editImage(this.getDisplay().displayImages.length - 1, editImageComponent);
	}

	editImage(imageIndex: number, editImageComponent: EditImageComponent) {
		this.editImageDialogVisible = true;
		editImageComponent.updateForm(imageIndex);
	}

	moveImage(imageIndex: number, direction: number) {
		const displayImages = this.getDisplay().displayImages;
		const targetImageIndex = Math.max(0, Math.min(displayImages.length - 1, imageIndex + direction));

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
}
