import {Component, Input, model} from "@angular/core";
import {DialogModule} from "primeng/dialog";
import {TooltipModule} from "primeng/tooltip";

@Component({
	selector: "app-dialog",
	imports: [
		DialogModule,
		TooltipModule,
	],
	templateUrl: "./dialog.component.html",
	styleUrls: ["./dialog.component.scss"],
})
export class DialogComponent {
	@Input({required: true}) title!: string;
	@Input() maxWidth = "96rem";
	@Input() maxHeight = "96rem";
	visible = model<boolean>(false);
}
