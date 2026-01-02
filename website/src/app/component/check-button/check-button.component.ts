import {Component, EventEmitter, Input, model, Output} from "@angular/core";
import {TooltipModule} from "primeng/tooltip";
import {ButtonModule} from "primeng/button";

@Component({
	selector: "app-check-button",
	imports: [
		ButtonModule,
		TooltipModule,
	],
	templateUrl: "./check-button.component.html",
	styleUrls: ["./check-button.component.scss"],
})
export class CheckButtonComponent {
	@Input({required: true}) icon!: string;
	@Input({required: true}) tooltip!: string;
	@Output() clickCheckButton = new EventEmitter();
	protected readonly showCheck = model<boolean>(false);
	private timeoutId = 0;

	click() {
		this.showCheck.set(true);
		clearTimeout(this.timeoutId);
		this.timeoutId = setTimeout(() => this.showCheck.set(false), 2000);
		this.clickCheckButton.emit();
	}
}
