import {ByteReader} from "../utility/byteReader";

export interface Displays {
	width: number;
	height: number;
	imageCount: number;
	byteReader: ByteReader;
	indexList: { groups: string[], fileName: string }[];
}
