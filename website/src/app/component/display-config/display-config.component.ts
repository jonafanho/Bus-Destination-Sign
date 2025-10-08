import {Component, Input, OnInit} from "@angular/core";
import {ButtonModule} from "primeng/button";
import {TranslocoDirective} from "@jsverse/transloco";
import {CardModule} from "primeng/card";
import {SelectModule} from "primeng/select";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DisplayType} from "../../type/display-type";
import {DataService} from "../../service/data.service";
import {InputNumberModule} from "primeng/inputnumber";
import {FloatLabelModule} from "primeng/floatlabel";
import {AccordionModule} from "primeng/accordion";

@Component({
	selector: "app-display-config",
	imports: [
		CardModule,
		SelectModule,
		InputNumberModule,
		AccordionModule,
		ButtonModule,
		FloatLabelModule,
		TranslocoDirective,
		FormsModule,
		ReactiveFormsModule,
	],
	templateUrl: "./display-config.component.html",
	styleUrls: ["./display-config.component.css"],
})
export class DisplayConfigComponent implements OnInit {
	@Input({required: true}) index!: number;
	readonly types: { name: string, value: DisplayType }[] = [
		{name: "none", value: "NONE"},
		{name: "SSD1322 (256×64)", value: "SSD1322"},
		{name: "SH1106 (128×64)", value: "SH1106"},
	];
	readonly formGroup;

	constructor(private readonly dataService: DataService, private readonly formBuilder: FormBuilder) {
		this.formGroup = this.formBuilder.group({
			displayType: new FormControl("NONE" as DisplayType),
			scale: new FormControl(1),
		});

		this.formGroup.valueChanges.subscribe(() => {
			const data = this.formGroup.getRawValue();
			this.dataService.saveDisplay(this.index, {
				displayType: data.displayType ?? "NONE",
				scale: data.scale ?? 1,
				displayImages: [],
			});
		});
	}

	ngOnInit(): void {
		// index is only loaded at this point
		const display = this.getDisplay();
		this.formGroup.get("displayType")?.setValue(display.displayType);
		this.formGroup.get("scale")?.setValue(display.scale);
	}

	getDisplay() {
		return this.dataService.getDisplays()[this.index];
	}
}
