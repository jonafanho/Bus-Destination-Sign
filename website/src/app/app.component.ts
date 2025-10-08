import {Component} from "@angular/core";
import {DisplayConfigComponent} from "./component/display-config/display-config.component";
import {DataService} from "./service/data.service";
import {ProgressSpinnerModule} from "primeng/progressspinner";

@Component({
	selector: "app-root",
	imports: [
		ProgressSpinnerModule,
		DisplayConfigComponent,
	],
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.css"],
})
export class AppComponent {

	constructor(private readonly dataService: DataService) {
	}

	getInitCompleted() {
		return this.dataService.initCompleted();
	}

	getDisplays() {
		return this.dataService.getDisplays();
	}
}
