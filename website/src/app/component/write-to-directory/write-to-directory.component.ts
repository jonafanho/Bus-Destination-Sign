import {Component, inject, signal} from "@angular/core";
import {TranslocoDirective} from "@jsverse/transloco";
import {HttpClient} from "@angular/common/http";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {DialogComponent} from "../dialog/dialog.component";
import {DialogService} from "../../service/dialog.service";
import {getCookie, getUrl, setCookie} from "../../utility/utilities";
import {TooltipModule} from "primeng/tooltip";
import {FloatLabelModule} from "primeng/floatlabel";
import {FormBuilder, FormControl, ReactiveFormsModule} from "@angular/forms";
import {UploadButtonComponent} from "../upload-button/upload-button.component";
import {InputTextModule} from "primeng/inputtext";
import {MessageModule} from "primeng/message";

@Component({
	selector: "app-write-to-directory",
	imports: [
		InputTextModule,
		MessageModule,
		ProgressSpinnerModule,
		FloatLabelModule,
		TooltipModule,
		TranslocoDirective,
		DialogComponent,
		ReactiveFormsModule,
		UploadButtonComponent,
	],
	templateUrl: "./write-to-directory.component.html",
	styleUrls: ["./write-to-directory.component.scss"],
})
export class WriteToDirectoryComponent {
	private readonly httpClient = inject(HttpClient);

	protected readonly loading = signal<boolean>(false);
	protected readonly state = signal<"none" | "success" | "error">("none");
	protected readonly formGroup;
	protected writeToDirectoryDialogVisible = false;
	private timeoutId = 0;

	constructor() {
		const dialogService = inject(DialogService);
		const formBuilder = inject(FormBuilder);

		const directory = getCookie("directory");
		this.formGroup = formBuilder.group({
			directory: new FormControl(directory ? directory : "D:\\"),
		});

		dialogService.openWriteToDirectoryDialog.subscribe(() => this.writeToDirectoryDialogVisible = true);
	}

	upload() {
		const directory = this.formGroup.getRawValue().directory;
		if (directory) {
			this.loading.set(true);
			setCookie("directory", directory);
			this.httpClient.get<boolean>(`${getUrl()}api/writeToDirectory/${encodeURIComponent(directory)}`).subscribe({
				next: success => {
					this.loading.set(false);
					this.setState(success ? "success" : "error");
				},
				error: () => {
					this.loading.set(false);
					this.setState("error");
				},
			});
		}
	}

	noDirectorySelected() {
		return !this.formGroup.getRawValue().directory;
	}

	private setState(state: "success" | "error") {
		this.state.set(state);
		clearTimeout(this.timeoutId);
		this.timeoutId = setTimeout(() => this.state.set("none"), 3000);
	}
}
