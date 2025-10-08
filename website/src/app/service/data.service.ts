import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {StopReporter} from "../data/stop-reporter";
import {getUrl} from "../utility/utilities";
import {Display} from "../data/display";

@Injectable({providedIn: "root"})
export class DataService {
	private displaysLoaded = false;
	private stopReporterLoaded = false;

	private displays: Display[] = [];
	private stopReporterList: StopReporter[] = [];
	private stopReporterLoading = false;

	constructor(private readonly httpClient: HttpClient) {
		this.httpClient.get<Display[]>(`${getUrl()}api/getDisplays`).subscribe(data => {
			this.displays = data;
			this.displaysLoaded = true;
		});

		this.httpClient.get<StopReporter[]>(`${getUrl()}api/getStopReporterDisplays`).subscribe(data => {
			this.stopReporterList = data;
			this.sortData();
			this.stopReporterLoaded = true;
		});
	}

	initCompleted() {
		return this.displaysLoaded && this.stopReporterLoaded;
	}

	getDisplays() {
		return this.displays;
	}

	saveDisplay(index: number, display: Display) {
		this.displays[index] = display;
		this.httpClient.post(`${getUrl()}api/saveDisplays`, this.displays).subscribe();
	}

	fetchStopReporterDisplays() {
		this.stopReporterLoading = true;
		this.httpClient.get<StopReporter[]>(`${getUrl()}api/fetchStopReporterDisplays`).subscribe(data => {
			this.stopReporterList = data;
			this.sortData();
			this.stopReporterLoading = false;
		});
	}

	getStopReporterList() {
		return this.stopReporterList;
	}

	getStopReporterLoading() {
		return this.stopReporterLoading;
	}

	private sortData() {
		this.stopReporterList.sort((stopReporter1, stopReporter2) => stopReporter1.category.localeCompare(stopReporter2.category));
	}
}
