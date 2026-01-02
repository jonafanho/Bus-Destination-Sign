import {Component, EventEmitter, HostListener, Input, Output, WritableSignal} from "@angular/core";
import {TooltipModule} from "primeng/tooltip";
import {TranslocoDirective} from "@jsverse/transloco";
import {clamp} from "../../utility/utilities";

@Component({
	selector: "app-drag-point",
	imports: [
		TooltipModule,
		TranslocoDirective,
	],
	templateUrl: "./drag-point.component.html",
	styleUrls: ["./drag-point.component.scss"],
})
export class DragPointComponent {
	@Input({required: true}) width!: number;
	@Input({required: true}) height!: number;
	@Input({required: true}) zoom!: number;
	@Input({required: true}) dragPoints!: WritableSignal<{ x: number, y: number, isBar: boolean, visible: boolean, tooltip: string }[]>;
	@Output() dragPointMoved = new EventEmitter();
	private offset = {x: 0, y: 0};
	private currentDragPoint ?: { x: number, y: number, isBar: boolean };

	onMouseDown(dragPoint: { x: number, y: number, isBar: boolean }, event: MouseEvent) {
		this.currentDragPoint = dragPoint;
		this.offset.x = event.clientX - dragPoint.x * this.zoom;
		this.offset.y = event.clientY - dragPoint.y * this.zoom;
	}

	onMouseMove(event: MouseEvent) {
		if (this.currentDragPoint) {
			this.currentDragPoint.x = clamp(Math.round((event.clientX - this.offset.x) / this.zoom), 0, this.width - 1);
			this.currentDragPoint.y = this.currentDragPoint.isBar ? 0 : clamp(Math.round((event.clientY - this.offset.y) / this.zoom), 0, this.height - 1);
			this.dragPointMoved.emit();
		}
	}

	@HostListener("document:pointerup")
	@HostListener("document:pointercancel")
	onMouseUp() {
		this.currentDragPoint = undefined;
	}

	getDragPointStyle(dragPoint: { x: number, y: number, isBar: boolean }) {
		return {
			left: `${(dragPoint.x + (dragPoint.isBar ? 0 : 0.5)) * this.zoom}px`,
			top: `${(dragPoint.y + (dragPoint.isBar ? this.height / 2 : 0.5)) * this.zoom}px`,
		};
	}
}
