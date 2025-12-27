import {EventEmitter, Injectable} from "@angular/core";

@Injectable({providedIn: "root"})
export class DialogService {
	readonly openEditImageDialog = new EventEmitter();
	readonly openUploadToDeviceDialog = new EventEmitter();
	readonly openRawImageManagerDialog = new EventEmitter();
}
