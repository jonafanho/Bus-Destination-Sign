import {inject, Injectable, signal} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {StopReporter} from "../data/stop-reporter";
import {DataServiceBase} from "./data.service.base";
import {getUrl} from "../utility/utilities";

@Injectable({providedIn: "root"})
export class StopReporterService extends DataServiceBase<StopReporter> {
	readonly fetchDisplays: () => void;
	readonly fetchDisplaysLoading = signal(false);

	constructor() {
		const httpClient = inject(HttpClient);

		super("api/getStopReporterDisplays");
		this.dataUpdated.subscribe(() => this.data().sort((stopReporter1, stopReporter2) => stopReporter1.category.localeCompare(stopReporter2.category)));
		this.fetchDisplays = () => {
			this.fetchDisplaysLoading.set(true);
			httpClient.get<StopReporter[]>(`${getUrl()}api/fetchStopReporterDisplays`).subscribe(() => {
				this.fetchData();
				this.fetchDisplaysLoading.set(false);
			});
		};
	}
}
