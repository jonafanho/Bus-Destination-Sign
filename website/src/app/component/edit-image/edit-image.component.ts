import {Component, Input} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TooltipModule} from "primeng/tooltip";
import {DisplayService} from "../../service/display.service";
import {ImageModule} from "primeng/image";
import {getUrl} from "../../utility/utilities";

@Component({
	selector: "app-edit-image",
	imports: [
		ImageModule,
		TooltipModule,
		FormsModule,
		ReactiveFormsModule,
	],
	templateUrl: "./edit-image.component.html",
	styleUrls: ["./edit-image.component.css"],
})
export class EditImageComponent {
	@Input({required: true}) displayIndex!: number;
	private imageIndex = -1;

	constructor(private readonly displayService: DisplayService) {
	}

	updateForm(imageIndex: number) {
		this.imageIndex = imageIndex;
	}

	getDisplayImages() {
		const display = this.displayService.getData()[this.displayIndex];
		return display && display.displayImages ? display.displayImages[this.imageIndex] : undefined;
	}

	getImageUrl() {
		return `${getUrl()}api/getRawImage/${this.getDisplayImages()?.rawImageId}`;
	}
}
