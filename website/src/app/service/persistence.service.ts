import {inject, Injectable} from "@angular/core";
import {Data} from "../entity/data";
import {HttpClient} from "@angular/common/http";
import {DisplaysService} from "./displays.service";
import {SettingsService} from "./settings.service";

@Injectable({providedIn: "root"})
export class PersistenceService {
	private readonly httpClient = inject(HttpClient);
	private readonly displaysService = inject(DisplaysService);
	private readonly settingsService = inject(SettingsService);

	constructor() {
		this.httpClient.get<Data>("api/getData").subscribe(data => {
			this.displaysService.read(data.displays);
			this.settingsService.read(data.settings);
		});
	}

	save() {
		const data: Data = {
			displays: this.displaysService.write(),
			settings: this.settingsService.write(),
		};
		return this.httpClient.post("api/saveData", data);
	}
}
