import {Component, inject, model, signal} from "@angular/core";
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
import {FormatCategoryPipe} from "../../pipe/format-category.pipe";

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
		FormatCategoryPipe,
		ReactiveFormsModule,
		TranslocoDirective,
	],
	templateUrl: "./stop-reporter.component.html",
	styleUrls: ["./stop-reporter.component.scss"],
})
export class StopReporterComponent {
	private readonly httpClient = inject(HttpClient);
	private readonly stopReporterService = inject(StopReporterService);
	private readonly rawImageService = inject(RawImageService);

	protected readonly searchFormGroup;
	protected readonly categoryFiltersFormGroup = new FormGroup<Record<string, FormControl<boolean | null>>>({});
	protected readonly filteredStopReporterList = signal<StopReporter[]>([]);
	protected readonly categories = signal<[string, boolean][]>([]);
	protected readonly downloadStatus = signal<Record<string, "loading" | "success">>({});
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
		this.visible.subscribe(() => this.downloadStatus.set({}));
	}

	fetchStopReporterDisplays() {
		this.stopReporterService.fetchDisplays();
	}

	getStopReporterLoading() {
		return this.stopReporterService.loading() || this.stopReporterService.fetchDisplaysLoading();
	}

	getGoogleDriveImage(id: string) {
		return `${getUrl()}api/getGoogleDriveImage/${id}?height=48`;
	}

	downloadStopReporter(id: string) {
		const downloadStatus1 = {...this.downloadStatus()};
		downloadStatus1[id] = "loading";
		this.downloadStatus.set(downloadStatus1);
		this.httpClient.get(`${getUrl()}api/saveGoogleDriveImage/${id}`).subscribe({
			next: () => {
				const downloadStatus2 = {...this.downloadStatus()};
				downloadStatus2[id] = "success";
				this.downloadStatus.set(downloadStatus2);
				this.rawImageService.fetchData();
			},
			error: () => {
				const downloadStatus2 = {...this.downloadStatus()};
				delete downloadStatus2[id];
				this.downloadStatus.set(downloadStatus2);
			},
		});
	}

	hasData() {
		return this.stopReporterService.data().length > 0;
	}

	private filter() {
		const {searches, exactMatch} = this.searchFormGroup.getRawValue();
		const categoryFilters = Object.values(this.categoryFiltersFormGroup.getRawValue());
		const visibleAndSelectedCategories: string[] = [];
		const searchesMatch = (stopReporter: StopReporter) => !searches || searches.length === 0 || searches.every(search => stopReporter.groups.some(group => exactMatch ? group.toLowerCase() === search.toLowerCase() : group.toLowerCase().includes(search.toLowerCase())));
		const filteredStopReporterList: StopReporter[] = [];
		const categories: [string, boolean][] = [];
		let previousCategory: string | undefined;
		let categoryVisible = false;

		// Build categories
		this.stopReporterService.data().forEach(stopReporter => {
			if (previousCategory && previousCategory !== stopReporter.category) {
				if (categoryVisible && categoryFilters[categories.length]) {
					visibleAndSelectedCategories.push(previousCategory);
				}
				categories.push([previousCategory, categoryVisible]);
				categoryVisible = false;
			}
			previousCategory = stopReporter.category;
			if (searchesMatch(stopReporter)) {
				categoryVisible = true;
			}
		});

		if (previousCategory) {
			categories.push([previousCategory, categoryVisible]);
		}

		// Build results
		const noCategoryFilters = visibleAndSelectedCategories.length === 0;
		this.stopReporterService.data().forEach(stopReporter => {
			if ((noCategoryFilters || visibleAndSelectedCategories.includes(stopReporter.category)) && searchesMatch(stopReporter)) {
				filteredStopReporterList.push(stopReporter);
			}
		});

		// Add missing form controls if necessary
		for (let i = 0; i < categories.length; i++) {
			if (!this.categoryFiltersFormGroup.contains(`categoryFilter${i}`)) {
				this.categoryFiltersFormGroup.addControl(`categoryFilter${i}`, new FormControl(false));
			}
		}

		this.filteredStopReporterList.set(filteredStopReporterList);
		this.categories.set(categories);
	}
}
