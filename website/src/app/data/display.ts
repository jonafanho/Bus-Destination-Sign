import {DisplayType} from "../type/display-type";
import {DisplayImage} from "./display-image";

export interface Display {
	readonly displayType: DisplayType;
	readonly scale: number;
	readonly displayImages: DisplayImage[];
}
