import {Component, Input, OnInit} from "@angular/core";
import {FormGroup, FormsModule} from "@angular/forms";
import {InputNumberModule} from "primeng/inputnumber";
import {FloatLabelModule} from "primeng/floatlabel";
import {SliderModule} from "primeng/slider";

@Component({
	selector: "app-input-number-with-slider",
	imports: [
		InputNumberModule,
		SliderModule,
		FloatLabelModule,
		FormsModule,
	],
	templateUrl: "./input-number-with-slider.component.html",
	styleUrls: ["./input-number-with-slider.component.css"],
})
export class InputNumberWithSliderComponent implements OnInit {
	@Input({required: true}) label!: string;
	@Input({required: true}) min!: number;
	@Input({required: true}) max!: number;
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
}
