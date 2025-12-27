import {Component, EventEmitter, Input, Output} from "@angular/core";
import {ButtonModule} from "primeng/button";

@Component({
	selector: "app-upload-button",
	imports: [
		ButtonModule,
	],
	templateUrl: "./upload-button.component.html",
	styleUrls: ["./upload-button.component.scss"],
})
export class UploadButtonComponent {
	@Input({required: true}) icons!: string[];
	@Input({required: true}) title!: string;
	@Input({required: true}) disabled!: boolean;
	@Output() uploadClick = new EventEmitter();
}
