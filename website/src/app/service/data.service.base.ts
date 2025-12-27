import {EventEmitter, inject, Injectable, signal} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {getUrl} from "../utility/utilities";

@Injectable({providedIn: "root"})
export abstract class DataServiceBase<T> {
	private readonly httpClient = inject(HttpClient);

	readonly data = signal<T[]>([]);
	readonly dataInitialized = signal(false);
	readonly loading = signal(false);
	readonly dataUpdated = new EventEmitter();

	// eslint-disable-next-line @angular-eslint/prefer-inject
	protected constructor(private readonly url: string) {
		this.fetchData();
	}

	fetchData() {
		this.loading.set(true);
		this.httpClient.get<T[]>(`${getUrl()}${this.url}`).subscribe(data => {
			this.data.set(data);
			this.dataInitialized.set(true);
			this.loading.set(false);
			this.dataUpdated.emit();
		});
	}
}
