import {Component, inject, model} from "@angular/core";
import {ButtonModule} from "primeng/button";
import {TableModule} from "primeng/table";
import {TranslocoDirective} from "@jsverse/transloco";
import {getUrl} from "../../utility/utilities";
import {StopReporterService} from "../../service/stop-reporter.service";
import {DialogComponent} from "../dialog/dialog.component";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {TooltipModule} from "primeng/tooltip";
import {FloatLabelModule} from "primeng/floatlabel";
import {DividerModule} from "primeng/divider";
import {CheckboxModule} from "primeng/checkbox";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {AutoCompleteModule} from "primeng/autocomplete";
import {StopReporter} from "../../data/stop-reporter";
import {HttpClient} from "@angular/common/http";
import {RawImageService} from "../../service/raw-image.service";

@Component({
	selector: "app-stop-reporter",
	imports: [
		ButtonModule,
		AutoCompleteModule,
		FloatLabelModule,
		CheckboxModule,
		DividerModule,
		TableModule,
		ProgressSpinnerModule,
		TooltipModule,
		DialogComponent,
		ReactiveFormsModule,
		TranslocoDirective,
	],
	templateUrl: "./stop-reporter.component.html",
	styleUrls: ["./stop-reporter.component.css"],
})
export class StopReporterComponent {
	private readonly httpClient = inject(HttpClient);
	private readonly stopReporterService = inject(StopReporterService);
	private readonly rawImageService = inject(RawImageService);

	protected readonly searchFormGroup;
	protected readonly categoryFiltersFormGroup = new FormGroup<Record<string, FormControl<boolean | null>>>({});
	protected readonly filteredStopReporterList: StopReporter[] = [];
	protected readonly categories: [string, boolean][] = [];
	protected downloadStatus: Record<string, "loading" | "success"> = {};
	visible = model<boolean>(false);

	constructor() {
		const formBuilder = inject(FormBuilder);

		this.searchFormGroup = formBuilder.group({
			searches: new FormControl([] as string[]),
			exactMatch: new FormControl(true),
		});

		this.searchFormGroup.valueChanges.subscribe(() => this.filter());
		this.categoryFiltersFormGroup.valueChanges.subscribe(() => this.filter());
		this.stopReporterService.dataUpdated.subscribe(() => this.filter());
		this.visible.subscribe(() => this.downloadStatus = {});
	}

	fetchStopReporterDisplays() {
		this.stopReporterService.fetchDisplays();
	}

	getStopReporterList() {
		return this.filteredStopReporterList;
	}

	getStopReporterLoading() {
		return this.stopReporterService.getLoading() || this.stopReporterService.getFetchDisplaysLoading();
	}

	getGoogleDriveImage(id: string) {
		return `${getUrl()}api/getGoogleDriveImage/${id}?height=48`;
	}

	downloadStopReporter(id: string) {
		this.downloadStatus[id] = "loading";
		this.httpClient.get(`${getUrl()}api/saveGoogleDriveImage/${id}`).subscribe({
			next: () => {
				this.downloadStatus[id] = "success";
				this.rawImageService.fetchData();
			},
			error: () => delete this.downloadStatus[id],
		});
	}

	private filter() {
		const {searches, exactMatch} = this.searchFormGroup.getRawValue();
		const categoryFilters = Object.values(this.categoryFiltersFormGroup.getRawValue());
		const noCategoryFilters = categoryFilters.every(value => !value);
		const noSearches = !searches || searches.length === 0;
		this.filteredStopReporterList.length = 0;
		this.categories.length = 0;
		let previousCategory: string | undefined;
		let categoryMatch = false;

		this.stopReporterService.getData().forEach(stopReporter => {
			if (previousCategory && previousCategory !== stopReporter.category) {
				this.categories.push([previousCategory, categoryMatch]);
				categoryMatch = false;
			}
			previousCategory = stopReporter.category;
			const match = noSearches || searches.every(search => stopReporter.groups.some(group => exactMatch ? group.toLowerCase() === search.toLowerCase() : group.toLowerCase().includes(search.toLowerCase())));
			if (match) {
				if (noCategoryFilters || categoryFilters[this.categories.length]) {
					this.filteredStopReporterList.push(stopReporter);
				}
				categoryMatch = true;
			}
		});

		if (previousCategory) {
			this.categories.push([previousCategory, categoryMatch]);
		}

		for (let i = 0; i < this.categories.length; i++) {
			if (!this.categoryFiltersFormGroup.contains(`categoryFilter${i}`)) {
				this.categoryFiltersFormGroup.addControl(`categoryFilter${i}`, new FormControl(false));
			}
		}
	}
}
