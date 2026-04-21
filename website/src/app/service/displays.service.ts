import {inject, Injectable, signal} from "@angular/core";
import {BOARDS} from "../utility/constants";
import {PersistedServiceBase} from "./persisted.service.base";
import {PersistedDisplay} from "../entity/data";
import {LibraryService} from "./library.service";

@Injectable({providedIn: "root"})
export class DisplaysService extends PersistedServiceBase<PersistedDisplay[][][]> {
	private readonly libraryService = inject(LibraryService);
	readonly displayGroups = signal<string[][][]>([]);

	override read(data: PersistedDisplay[][][]) {
		this.displayGroups.set(data.map(displayGroup => displayGroup.map(displaysForBoard => displaysForBoard.map(({fileName}) => fileName))));
	}

	override write(): PersistedDisplay[][][] {
		return this.displayGroups().map(displayGroup => displayGroup.map(displaysForBoard => displaysForBoard.map(fileName => this.libraryService.getPersistedDisplay(fileName)).filter(display => display !== undefined)));
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
