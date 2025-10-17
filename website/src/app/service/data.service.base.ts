import {EventEmitter, inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {getUrl} from "../utility/utilities";

@Injectable({providedIn: "root"})
export abstract class DataServiceBase<T> {
	private readonly httpClient = inject(HttpClient);

	private data: T[] = [];
	private dataInitialized = false;
	private loading = false;

	public readonly getData = () => this.data;
	public readonly getDataInitialized = () => this.dataInitialized;
	public readonly getLoading = () => this.loading;
	public readonly dataUpdated = new EventEmitter();

	// eslint-disable-next-line @angular-eslint/prefer-inject
	protected constructor(private readonly url: string) {
		this.fetchData();
	}

	fetchData() {
		this.loading = true;
		this.httpClient.get<T[]>(`${getUrl()}${this.url}`).subscribe(data => {
			this.data = data;
			this.dataInitialized = true;
			this.loading = false;
			this.dataUpdated.emit();
		});
	}
}
