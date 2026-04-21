import {Component, inject, input, signal} from "@angular/core";
import {TranslocoDirective, TranslocoService} from "@jsverse/transloco";
import {ButtonModule} from "primeng/button";
import {MessageService, ToastMessageOptions} from "primeng/api";
import {ToastModule} from "primeng/toast";
import {PersistenceService} from "../../service/persistence.service";

@Component({
	selector: "app-save-button",
	imports: [
		ButtonModule,
		ToastModule,
		TranslocoDirective,
	],
	templateUrl: "./save-button.component.html",
	styleUrls: ["./save-button.component.scss"],
	providers: [MessageService],
})
export class SaveButtonComponent<T> {
	private readonly persistenceService = inject(PersistenceService);
	private readonly messageService = inject(MessageService);
	private readonly translocoService = inject(TranslocoService);

	readonly isSaving = signal(false);
	readonly successTranslationKey = input.required<string>();
	readonly errorTranslationKey = input.required<string>();
	readonly payloadProvider = input.required<() => T>();

	save() {
		this.isSaving.set(true);
		this.persistenceService.save().subscribe({
			next: () => this.addToast({severity: "success", summary: this.translocoService.translate("common.success"), detail: this.translocoService.translate(this.successTranslationKey())}),
			error: () => this.addToast({severity: "error", summary: this.translocoService.translate("common.error"), detail: this.translocoService.translate(this.errorTranslationKey())}),
		});
	}

	private addToast(toastMessageOptions: ToastMessageOptions) {
		this.isSaving.set(false);
		this.messageService.add(toastMessageOptions);
	}
}
