import {Component, inject, signal} from "@angular/core";
import {ButtonModule} from "primeng/button";
import {TranslocoDirective} from "@jsverse/transloco";
import {HttpClient} from "@angular/common/http";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {DialogComponent} from "../dialog/dialog.component";
import {DialogService} from "../../service/dialog.service";
import {getUrl} from "../../utility/utilities";
import {TooltipModule} from "primeng/tooltip";
import {FloatLabelModule} from "primeng/floatlabel";
import {FormBuilder, FormControl, ReactiveFormsModule} from "@angular/forms";
import {SelectModule} from "primeng/select";
import {UploadButtonComponent} from "../upload-button/upload-button.component";

@Component({
	selector: "app-upload-to-device",
	imports: [
		ButtonModule,
		ProgressSpinnerModule,
		FloatLabelModule,
		SelectModule,
		TooltipModule,
		TranslocoDirective,
		DialogComponent,
		ReactiveFormsModule,
		UploadButtonComponent,
	],
	templateUrl: "./upload-to-device.component.html",
	styleUrls: ["./upload-to-device.component.scss"],
})
export class UploadToDeviceComponent {
	private readonly httpClient = inject(HttpClient);

	readonly noDeviceSelection = "none";
	readonly loading = signal<boolean>(false);
	readonly portNames = signal<string[]>([this.noDeviceSelection]);
	protected readonly formGroup;
	protected uploadToDeviceDialogVisible = false;

	constructor() {
		const dialogService = inject(DialogService);
		const formBuilder = inject(FormBuilder);

		this.formGroup = formBuilder.group({
			portName: new FormControl(this.noDeviceSelection),
		});

		dialogService.openUploadToDeviceDialog.subscribe(() => this.uploadToDeviceDialogVisible = true);
		this.detectEspPortNames();
	}

	detectEspPortNames() {
		this.loading.set(true);
		this.httpClient.get<string[]>(`${getUrl()}api/detectEspPortNames`).subscribe({
			next: data => {
				this.loading.set(false);
				if (data.length === 0) {
					this.portNames.set([this.noDeviceSelection]);
					this.formGroup.get("portName")?.disable();
				} else {
					this.portNames.set(data);
					this.formGroup.get("portName")?.enable();
				}
				this.updateSelection();
			},
			error: () => {
				this.loading.set(false);
				this.portNames.set([" "]);
				this.formGroup.get("portName")?.disable();
				this.updateSelection();
			},
		});
	}

	upload(includeImages: boolean) {
		const portName = this.formGroup.getRawValue().portName;
		if (portName && portName !== this.noDeviceSelection) {
			this.loading.set(true);
			this.httpClient.get<boolean>(`${getUrl()}api/${includeImages ? "writeSettingsAndImagesToEsp" : "writeSettingsToEsp"}/${portName}`).subscribe({
				next: () => {
					this.loading.set(false);
				},
				error: () => {
					this.loading.set(false);
				},
			});
		}
	}

	private updateSelection() {
		const data = this.formGroup.getRawValue();
		if (!data.portName || !this.portNames().includes(data.portName)) {
			this.formGroup.get("portName")?.setValue(this.portNames()[0]);
		}
	}
}
