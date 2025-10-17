import {EventEmitter, Injectable} from "@angular/core";

@Injectable({providedIn: "root"})
export class DialogService {
	readonly openRawImageManagerDialog = new EventEmitter();

	constructor() {
	}
}
