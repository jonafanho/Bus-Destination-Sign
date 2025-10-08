import {Component} from "@angular/core";
import {ButtonModule} from "primeng/button";
import {ProgressBarModule} from "primeng/progressbar";
import {TableModule} from "primeng/table";
import {DataService} from "../../service/data.service";
import {TranslocoDirective} from "@jsverse/transloco";
import {ImageModule} from "primeng/image";
import {getUrl} from "../../utility/utilities";

@Component({
	selector: "app-stop-reporter",
	imports: [
		ButtonModule,
		ProgressBarModule,
		TableModule,
		ImageModule,
		TranslocoDirective,
	],
	templateUrl: "./stop-reporter.component.html",
	styleUrls: ["./stop-reporter.component.css"],
})
export class StopReporterComponent {

	constructor(private readonly dataService: DataService) {
	}

	fetchStopReporterDisplays() {
		this.dataService.fetchStopReporterDisplays();
	}

	getStopReporterList() {
		return this.dataService.getStopReporterList();
	}

	getStopReporterLoading() {
		return this.dataService.getStopReporterLoading();
	}

	getGoogleDriveImage(id: string) {
		return `${getUrl()}api/getGoogleDriveImage/${id}`;
	}
}
