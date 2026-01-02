import {inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {getUrl} from "../utility/utilities";
import {Display} from "../data/display";
import {DataServiceBase} from "./data.service.base";
import {DisplayImage} from "../data/display-image";

@Injectable({providedIn: "root"})
export class DisplayService extends DataServiceBase<Display> {
	clipboard?: DisplayImage;
	readonly saveDisplays: () => void;
	private timeoutId = 0;
	private canSave = true;

	constructor() {
		const httpClient = inject(HttpClient);

		super("api/getDisplays");
		this.saveDisplays = () => {
			if (this.canSave) {
				clearTimeout(this.timeoutId);
				this.timeoutId = setTimeout(() => {
					this.canSave = false;
					httpClient.post(`${getUrl()}api/saveDisplays`, this.data()).subscribe({
						next: () => this.canSave = true,
						error: () => {
							this.canSave = true;
							this.saveDisplays();
						},
					});
				}, 1000);
			}
		};
	}
}
