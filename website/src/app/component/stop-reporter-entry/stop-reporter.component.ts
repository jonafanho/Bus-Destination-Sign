import {Component} from "@angular/core";
import {ButtonModule} from "primeng/button";
import {ProgressBarModule} from "primeng/progressbar";
import {TableModule} from "primeng/table";
import {TranslocoDirective} from "@jsverse/transloco";
import {ImageModule} from "primeng/image";
import {getUrl} from "../../utility/utilities";
import {StopReporterService} from "../../service/stop-reporter.service";

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

	constructor(private readonly stopReporterService: StopReporterService) {
	}

	fetchStopReporterDisplays() {
		this.stopReporterService.fetchData();
	}

	getStopReporterList() {
		return this.stopReporterService.getData();
	}

	getStopReporterLoading() {
		return this.stopReporterService.getLoading();
	}

	getGoogleDriveImage(id: string) {
		return `${getUrl()}api/getGoogleDriveImage/${id}`;
	}
}
