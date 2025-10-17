import {EventEmitter, inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {getUrl} from "../utility/utilities";
import {DataServiceBase} from "./data.service.base";

@Injectable({providedIn: "root"})
export class RawImageService extends DataServiceBase<string> {
	readonly deleteRawImage: (rawImageId: string) => void;
	readonly deleteRawImageFailed = new EventEmitter();

	constructor() {
		const httpClient = inject(HttpClient);

		super("api/getRawImageIds");
		this.deleteRawImage = rawImageId => httpClient.get(`${getUrl()}api/deleteRawImage/${rawImageId}`).subscribe({
			next: () => this.fetchData(),
			error: () => {
				this.deleteRawImageFailed.emit();
				this.fetchData();
			},
		});
	}
}
