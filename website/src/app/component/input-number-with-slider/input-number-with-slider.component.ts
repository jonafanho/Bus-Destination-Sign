import {Component, Input, OnInit} from "@angular/core";
import {FormGroup, FormsModule} from "@angular/forms";
import {InputNumberModule} from "primeng/inputnumber";
import {FloatLabelModule} from "primeng/floatlabel";
import {SliderModule} from "primeng/slider";
import {ButtonModule} from "primeng/button";
import {TooltipModule} from "primeng/tooltip";
import {TranslocoDirective} from "@jsverse/transloco";

@Component({
	selector: "app-input-number-with-slider",
	imports: [
		InputNumberModule,
		ButtonModule,
		SliderModule,
		FloatLabelModule,
		TooltipModule,
		FormsModule,
		TranslocoDirective,
	],
	templateUrl: "./input-number-with-slider.component.html",
	styleUrls: ["./input-number-with-slider.component.css"],
})
export class InputNumberWithSliderComponent implements OnInit {
	@Input({required: true}) label!: string;
	@Input({required: true}) min!: number;
	@Input({required: true}) max!: number;
	@Input({required: true}) defaultValue!: number;
	@Input({required: true}) childFormGroup!: FormGroup;
	@Input({required: true}) childFormControlName!: string;
	protected value = 0;

	constructor() {
	}

	ngOnInit() {
		this.value = this.childFormGroup.get(this.childFormControlName)?.getRawValue();
		this.childFormGroup.get(this.childFormControlName)?.valueChanges.subscribe(value => this.value = value);
	}

	change() {
		this.childFormGroup.get(this.childFormControlName)?.setValue(this.value);
	}

	disabled() {
		return this.childFormGroup.get(this.childFormControlName)?.disabled === true;
	}
}
