import {Component, EventEmitter, inject, Input, Output} from "@angular/core";
import {ButtonModule} from "primeng/button";
import {getUrl} from "../../utility/utilities";
import {TooltipModule} from "primeng/tooltip";
import {CardModule} from "primeng/card";
import {RawImageService} from "../../service/raw-image.service";

@Component({
	selector: "app-image-gallery",
	imports: [
		ButtonModule,
		CardModule,
		TooltipModule,
	],
	templateUrl: "./image-gallery.component.html",
	styleUrls: ["./image-gallery.component.scss"],
})
export class ImageGalleryComponent {
	private readonly rawImageService = inject(RawImageService);

	@Input({required: true}) icon!: string;
	@Output() clickRawImage = new EventEmitter<string>();

	getRawImageIds() {
		return this.rawImageService.data();
	}

	getUrlFromRawImageId(rawImageId: string) {
		return `${getUrl()}api/getRawImage/${rawImageId}`;
	}
}
