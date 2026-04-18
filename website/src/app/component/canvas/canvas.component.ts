import {Component, effect, ElementRef, inject, input, OnDestroy, viewChild} from "@angular/core";
import {LibraryService} from "../../service/library.service";
import {AnimationDriver} from "../../utility/animationDriver";

@Component({
	selector: "app-canvas",
	imports: [],
	templateUrl: "./canvas.component.html",
	styleUrls: ["./canvas.component.scss"],
})
export class CanvasComponent implements OnDestroy {
	private readonly libraryService = inject(LibraryService);

	readonly fileName = input.required<string>();
	private readonly wrapperRef = viewChild.required<ElementRef<HTMLDivElement>>("wrapper");
	private animationDriver?: AnimationDriver;
	private requestAnimationFrameId = 0;

	constructor() {
		effect(() => {
			this.fileName();
			this.update();
		});

		const tick = (time: number) => {
			this.animationDriver?.writeToImageData(time);
			this.requestAnimationFrameId = requestAnimationFrame(tick);
		};

		this.requestAnimationFrameId = requestAnimationFrame(tick);
	}

	ngOnDestroy() {
		cancelAnimationFrame(this.requestAnimationFrameId);
	}

	private update() {
		this.wrapperRef().nativeElement.innerHTML = "";
		const displayDetails = this.libraryService.getDisplayDetailsByFileName(this.fileName());
		if (displayDetails) {
			this.animationDriver = new AnimationDriver(displayDetails.displays, displayDetails.index);
			this.wrapperRef().nativeElement.appendChild(this.animationDriver.canvas);
		}
	}
}
