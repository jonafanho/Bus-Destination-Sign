import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {getUrl} from "../utility/utilities";
import {DataServiceBase} from "./data.service.base";

@Injectable({providedIn: "root"})
export class RawImageService extends DataServiceBase<string> {
	readonly deleteRawImage: (rawImageId: string) => void;

	constructor(httpClient: HttpClient) {
		super(httpClient, "api/getRawImageIds");
		this.deleteRawImage = rawImageId => httpClient.get(`${getUrl()}api/deleteRawImage/${rawImageId}`).subscribe(() => this.fetchData());
	}
}
