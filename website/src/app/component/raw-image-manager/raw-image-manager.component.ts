import {Component, inject} from "@angular/core";
import {ButtonModule} from "primeng/button";
import {TranslocoDirective} from "@jsverse/transloco";
import {MessageModule} from "primeng/message";
import {HttpClient} from "@angular/common/http";
import {getUrl} from "../../utility/utilities";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {DialogComponent} from "../dialog/dialog.component";
import {DialogService} from "../../service/dialog.service";
import {ImageGalleryComponent} from "../image-gallery/image-gallery.component";
import {RawImageService} from "../../service/raw-image.service";
import {StopReporterComponent} from "../stop-reporter-entry/stop-reporter.component";

const allowedExtensions = ["png", "jpeg", "bmp", "gif"];
const allowedTypes = allowedExtensions.map(extension => `image/${extension}`);
const allowedInput = allowedExtensions.map(extension => `.${extension}`).join(",");

@Component({
	selector: "app-raw-image-manager",
	imports: [
		ButtonModule,
		ProgressSpinnerModule,
		MessageModule,
		DialogComponent,
		ImageGalleryComponent,
		StopReporterComponent,
		TranslocoDirective,
	],
	templateUrl: "./raw-image-manager.component.html",
	styleUrls: ["./raw-image-manager.component.css"],
})
export class RawImageManagerComponent {
	private readonly httpClient = inject(HttpClient);
	private readonly rawImageService = inject(RawImageService);

	readonly allowedInput = allowedInput;
	protected rawImageManagerDialogVisible = false;
	protected stopReporterDialogVisible = false;
	protected dragging = false;
	protected state: "none" | "success" | "error" | "invalidTypes" | "deleteFailed" = "none";
	protected loading = false;
	private timeoutId = 0;

	constructor() {
		const dialogService = inject(DialogService);

		dialogService.openRawImageManagerDialog.subscribe(() => this.rawImageManagerDialogVisible = true);
		this.rawImageService.deleteRawImageFailed.subscribe(() => this.setState("deleteFailed"));
	}

	dragOver(event: DragEvent) {
		event.preventDefault();
		this.dragging = true;
	}

	drop(event: DragEvent) {
		event.preventDefault();
		this.dragging = false;
		this.upload(event.dataTransfer?.files);
	}

	upload(fileList?: FileList) {
		const fileListArray = fileList ? Array.from(fileList) : [];
		if (fileListArray.length > 0) {
			const filteredFiles = fileListArray.filter(file => allowedTypes.includes(file.type));
			if (filteredFiles.length > 0) {
				const formData = new FormData();
				filteredFiles.forEach(file => formData.append("files", file));
				this.loading = true;
				this.httpClient.post(`${getUrl()}api/saveRawImages`, formData).subscribe({
					next: () => {
						this.setState("success");
						this.loading = false;
						this.rawImageService.fetchData();
					},
					error: () => {
						this.setState("error");
						this.loading = false;
					},
				});
			} else {
				this.setState("invalidTypes");
			}
		}
	}

	deleteRawImage(rawImageId: string) {
		this.rawImageService.deleteRawImage(rawImageId);
	}

	private setState(state: "success" | "error" | "invalidTypes" | "deleteFailed") {
		this.state = state;
		clearTimeout(this.timeoutId);
		this.timeoutId = setTimeout(() => this.state = "none", 3000) as unknown as number;
	}
}
