import {inject, Injectable, signal} from "@angular/core";
import {BOARDS} from "../utility/constants";
import {PersistedServiceBase} from "./persisted.service.base";
import {PersistedDisplay} from "../entity/data";
import {LibraryService} from "./library.service";
import {BinaryBuilder} from "../utility/binary-builder";
import JSZip from "jszip";

@Injectable({providedIn: "root"})
export class DisplaysService extends PersistedServiceBase<PersistedDisplay[][][]> {
	private readonly libraryService = inject(LibraryService);
	readonly displayGroups = signal<string[][][]>([]);

	override read(data: PersistedDisplay[][][]) {
		this.displayGroups.set(data.map(displayGroup => displayGroup.map(displaysForBoard => displaysForBoard.map(({fileName}) => fileName))));
	}

	override write(): PersistedDisplay[][][] {
		const persistedDisplays: PersistedDisplay[][][] = [];
		const zip = new JSZip();

		this.displayGroups().forEach((displayGroup, groupIndex) => {
			const persistedDisplaysForGroup: PersistedDisplay[][] = [];

			displayGroup.forEach((displaysForBoard, boardIndex) => {
				const binaryBuilder = new BinaryBuilder(groupIndex, boardIndex);
				const persistedDisplaysForBoardInGroup: PersistedDisplay[] = [];

				displaysForBoard.forEach(fileName => {
					const persistedDisplayAndDisplays = this.libraryService.getPersistedDisplayAndDisplays(fileName);
					if (persistedDisplayAndDisplays) {
						persistedDisplaysForBoardInGroup.push(persistedDisplayAndDisplays.persistedDisplay);
						binaryBuilder.add(persistedDisplayAndDisplays.displays, persistedDisplayAndDisplays.persistedDisplay.index);
					}
				});

				binaryBuilder.build(zip);
				persistedDisplaysForGroup.push(persistedDisplaysForBoardInGroup);
			});

			persistedDisplays.push(persistedDisplaysForGroup);
		});

		zip.generateAsync({type: "blob"}).then(blob => {
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "SD Card.zip";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		});

		return persistedDisplays;
	}

	addGroup() {
		const displayGroups = this.displayGroups();
		const displayGroup: string[][] = [];
		BOARDS.forEach(() => displayGroup.push([]));
		displayGroups.push(displayGroup);
		this.displayGroups.set(displayGroups);
	}

	addDisplay(groupIndex: number, boardIndex: number, fileName: string) {
		const displayGroups = this.displayGroups();
		displayGroups[groupIndex][boardIndex].push(fileName);
		this.displayGroups.set(displayGroups);
	}
}
