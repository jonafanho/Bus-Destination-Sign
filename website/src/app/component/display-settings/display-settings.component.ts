import { Component, Input, inject } from "@angular/core";
import {TranslocoDirective} from "@jsverse/transloco";
import {SelectModule} from "primeng/select";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DisplayType, getDisplayTypeName} from "../../type/display-type";
import {InputNumberModule} from "primeng/inputnumber";
import {DisplayService} from "../../service/display.service";
import {FloatLabelModule} from "primeng/floatlabel";

@Component({
	selector: "app-display-settings",
	imports: [
		SelectModule,
		InputNumberModule,
		FloatLabelModule,
		TranslocoDirective,
		FormsModule,
		ReactiveFormsModule,
	],
	templateUrl: "./display-settings.component.html",
	styleUrls: ["./display-settings.component.css"],
})
export class DisplaySettingsComponent {
	private readonly displayService = inject(DisplayService);

	@Input({required: true}) displayIndex!: number;
	protected readonly getDisplayTypeName = getDisplayTypeName;
	protected readonly types: DisplayType [] = ["NONE", "SSD1322", "SH1106"];
	protected readonly formGroup;

	constructor() {
		const formBuilder = inject(FormBuilder);

		this.formGroup = formBuilder.group({
			displayType: new FormControl("NONE" as DisplayType),
		});

		this.formGroup.valueChanges.subscribe(() => {
			const data = this.formGroup.getRawValue();
			this.displayService.getData()[this.displayIndex] = {
				displayType: data.displayType ?? "NONE",
				displayImages: this.getDisplay().displayImages,
			};
			this.displayService.saveDisplays();
		});
	}

	updateForm(): void {
		const display = this.getDisplay();
		this.formGroup.get("displayType")?.setValue(display.displayType);
	}

	getDisplay() {
		return this.displayService.getData()[this.displayIndex];
	}
}
