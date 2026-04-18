import {Component, inject} from "@angular/core";
import {TranslocoDirective} from "@jsverse/transloco";
import {AccordionModule} from "primeng/accordion";
import {ButtonModule} from "primeng/button";
import {BOARDS} from "../../utility/constants";
import {DisplaysService} from "../../service/displays.service";
import {PanelModule} from "primeng/panel";
import {TooltipModule} from "primeng/tooltip";
import {LibraryService} from "../../service/library.service";
import {sortNumbers} from "../../utility/utilities";
import {DialogModule} from "primeng/dialog";
import {CanvasComponent} from "../canvas/canvas.component";
import {LibraryComponent} from "../library/library.component";

@Component({
	selector: "app-displays",
	imports: [
		AccordionModule,
		PanelModule,
		ButtonModule,
		DialogModule,
		TooltipModule,
		TranslocoDirective,
		CanvasComponent,
		LibraryComponent,
	],
	templateUrl: "./displays.component.html",
	styleUrls: ["./displays.component.scss"],
})
export class DisplaysComponent {
	private readonly displaysService = inject(DisplaysService);
	private readonly libraryService = inject(LibraryService);

	readonly boards = BOARDS;

	getDisplayGroups() {
		return this.displaysService.displayGroups();
	}

	getGroupTitle(displayGroup: string[][]) {
		const groups: string[] = [];
		displayGroup.forEach(fileNames => fileNames.forEach(fileName => this.libraryService.getDisplayDetailsByFileName(fileName)?.groups?.forEach(group => groups.push(group))));
		return [...new Set(groups)].sort(sortNumbers).join(", ");
	}

	addGroup() {
		this.displaysService.addGroup();
	}

	moveGroup(event: MouseEvent, groupIndex: number, direction: number) {
		event.stopPropagation();
		this.displaysService.moveGroup(groupIndex, direction);
	}

	deleteGroup(event: MouseEvent, groupIndex: number) {
		event.stopPropagation();
		this.displaysService.deleteGroup(groupIndex);
	}

	openDialog(libraryComponent: LibraryComponent, groupIndex: number, boardIndex: number) {
		libraryComponent.open(BOARDS[boardIndex].displaySizes, groupIndex, boardIndex);
	}

	moveDisplay(groupIndex: number, boardIndex: number, displayIndex: number, direction: number) {
		this.displaysService.moveDisplay(groupIndex, boardIndex, displayIndex, direction);
	}

	deleteDisplay(groupIndex: number, boardIndex: number, displayIndex: number) {
		this.displaysService.deleteDisplay(groupIndex, boardIndex, displayIndex);
	}
}
