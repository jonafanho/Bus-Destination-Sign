import {Component, EventEmitter, Input, Output} from "@angular/core";
import {ButtonModule} from "primeng/button";
import {getUrl} from "../../utility/utilities";
import {TooltipModule} from "primeng/tooltip";
import {CardModule} from "primeng/card";
import {ImageModule} from "primeng/image";
import {RawImageService} from "../../service/raw-image.service";

@Component({
	selector: "app-image-gallery",
	imports: [
		ButtonModule,
		CardModule,
		ImageModule,
		TooltipModule,

	],
	templateUrl: "./image-gallery.component.html",
	styleUrls: ["./image-gallery.component.css"],
})
export class ImageGalleryComponent {
	@Input({required: true}) icon = "";
	@Output() clickRawImage = new EventEmitter<string>();

	constructor(private readonly rawImageService: RawImageService) {
	}

	getRawImageIds() {
		return this.rawImageService.getData();
	}

	getUrlFromRawImageId(rawImageId: string) {
		return `${getUrl()}api/getRawImage/${rawImageId}`;
	}
}
