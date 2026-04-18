import {Injectable, signal} from "@angular/core";
import {BOARDS} from "../utility/constants";

@Injectable({providedIn: "root"})
export class DisplaysService {
	readonly displayGroups = signal<string[][][]>([]);

	addGroup() {
		const displayGroups = this.displayGroups();
		const displayGroup: string[][] = [];
		BOARDS.forEach(() => displayGroup.push([]));
		displayGroups.push(displayGroup);
		this.displayGroups.set(displayGroups);
	}

	moveGroup(groupIndex: number, direction: number) {
		const displayGroups = this.displayGroups();
		const newIndex = groupIndex + direction;
		if (newIndex >= 0 && newIndex < displayGroups.length) {
			[displayGroups[groupIndex], displayGroups[newIndex]] = [displayGroups[newIndex], displayGroups[groupIndex]];
			this.displayGroups.set(displayGroups);
		}
	}

	deleteGroup(groupIndex: number) {
		const displayGroups = this.displayGroups();
		displayGroups.splice(groupIndex, 1);
		this.displayGroups.set(displayGroups);
	}

	addDisplay(groupIndex: number, boardIndex: number, fileName: string) {
		const displayGroups = this.displayGroups();
		displayGroups[groupIndex][boardIndex].push(fileName);
		this.displayGroups.set(displayGroups);
	}

	moveDisplay(groupIndex: number, boardIndex: number, displayIndex: number, direction: number) {
		const displayGroups = this.displayGroups();
		const fileNames = displayGroups[groupIndex][boardIndex];
		const newIndex = displayIndex + direction;
		if (newIndex >= 0 && newIndex < fileNames.length) {
			[fileNames[displayIndex], fileNames[newIndex]] = [fileNames[newIndex], fileNames[displayIndex]];
			this.displayGroups.set(displayGroups);
		}
	}

	deleteDisplay(groupIndex: number, boardIndex: number, displayIndex: number) {
		const displayGroups = this.displayGroups();
		displayGroups[groupIndex][boardIndex].splice(displayIndex, 1);
		this.displayGroups.set(displayGroups);
	}
}
