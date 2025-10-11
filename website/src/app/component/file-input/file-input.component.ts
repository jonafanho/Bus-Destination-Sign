import {Component, EventEmitter, Output} from "@angular/core";
import {ButtonModule} from "primeng/button";
import {TranslocoDirective} from "@jsverse/transloco";
import {MessageModule} from "primeng/message";
import {HttpClient} from "@angular/common/http";
import {getUrl} from "../../utility/utilities";
import {ProgressSpinnerModule} from "primeng/progressspinner";

const allowedExtensions = ["png", "jpeg", "bmp", "gif"];
const allowedTypes = allowedExtensions.map(extension => `image/${extension}`);
const allowedInput = allowedExtensions.map(extension => `.${extension}`).join(",");

@Component({
	selector: "app-file-input",
	imports: [
		ButtonModule,
		ProgressSpinnerModule,
		MessageModule,
		TranslocoDirective,
	],
	templateUrl: "./file-input.component.html",
	styleUrls: ["./file-input.component.css"],
})
export class FileInputComponent {
	@Output() fileUpload = new EventEmitter();
	readonly allowedInput = allowedInput;
	protected dragging = false;
	protected state: "none" | "success" | "error" | "invalidTypes" = "none";
	protected loading = false;
	private timeoutId = 0;

	constructor(private readonly httpClient: HttpClient) {
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
						this.fileUpload.emit();
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

	private setState(state: "success" | "error" | "invalidTypes") {
		this.state = state;
		clearTimeout(this.timeoutId);
		this.timeoutId = setTimeout(() => this.state = "none", 3000) as unknown as number;
	}
}
