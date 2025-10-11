import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {getUrl} from "../utility/utilities";
import {Display} from "../data/display";
import {DataServiceBase} from "./data.service.base";

@Injectable({providedIn: "root"})
export class DisplayService extends DataServiceBase<Display> {
	readonly saveDisplays: () => void;
	private timeoutId = 0;
	private canSave = true;

	constructor(httpClient: HttpClient) {
		super(httpClient, "api/getDisplays");
		this.saveDisplays = () => {
			if (this.canSave) {
				clearTimeout(this.timeoutId);
				this.timeoutId = setTimeout(() => {
					this.canSave = false;
					httpClient.post(`${getUrl()}api/saveDisplays`, this.getData()).subscribe({
						next: () => this.canSave = true,
						error: () => {
							this.canSave = true;
							this.saveDisplays();
						},
					});
				}, 1000) as unknown as number;
			}
		};
	}
}
