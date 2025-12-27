import {Component, inject} from "@angular/core";
import {DisplayConfigComponent} from "./component/display-config/display-config.component";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {TranslocoDirective, TranslocoService} from "@jsverse/transloco";
import {ButtonModule} from "primeng/button";
import {TooltipModule} from "primeng/tooltip";
import {MenuItem, PrimeIcons} from "primeng/api";
import {getLanguageMapping, setCookie} from "./utility/utilities";
import {LangService} from "./service/lang.service";
import {ThemeService} from "./service/theme.service";
import {TieredMenuModule} from "primeng/tieredmenu";
import {DisplayService} from "./service/display.service";
import {RawImageService} from "./service/raw-image.service";
import {StopReporterService} from "./service/stop-reporter.service";
import {RawImageManagerComponent} from "./component/raw-image-manager/raw-image-manager.component";
import {DialogService} from "./service/dialog.service";
import {UploadToDeviceComponent} from "./component/upload-to-device/upload-to-device.component";

@Component({
	selector: "app-root",
	imports: [
		ProgressSpinnerModule,
		ButtonModule,
		TooltipModule,
		TieredMenuModule,
		DisplayConfigComponent,
		UploadToDeviceComponent,
		RawImageManagerComponent,
		TranslocoDirective,
	],
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"],
})
export class AppComponent {
	private readonly displayService = inject(DisplayService);
	private readonly rawImageService = inject(RawImageService);
	private readonly stopReporterService = inject(StopReporterService);
	private readonly dialogService = inject(DialogService);
	private readonly themeService = inject(ThemeService);
	private readonly translocoService = inject(TranslocoService);

	readonly menuItems: MenuItem[];
	readonly themeMenuItem: MenuItem = {
		id: "menu.toggle-theme", command: () => {
			this.themeService.setTheme(!this.themeService.darkTheme());
			this.updateThemeMenuIcon();
		},
	};
	private readonly languageMenuItems: MenuItem[];

	constructor() {
		const translocoService = this.translocoService;
		const langService = inject(LangService);

		this.languageMenuItems = translocoService.getAvailableLangs().map(langDefinition => {
			const lang = langDefinition.toString();
			return ({
				id: lang,
				icon: PrimeIcons.CHECK,
				label: getLanguageMapping(lang),
				command: () => {
					translocoService.setActiveLang(lang);
					setCookie("lang", lang);
				},
			});
		});

		this.menuItems = [{id: "menu.language", icon: PrimeIcons.LANGUAGE, items: this.languageMenuItems}, this.themeMenuItem];

		translocoService.events$.subscribe(events => {
			if (events.type === "translationLoadSuccess" || events.type === "langChanged") {
				this.updateMenuItems();
			}
		});

		langService.init();
		this.updateMenuItems();
		this.updateThemeMenuIcon();
	}

	getDataInitialized() {
		return this.displayService.dataInitialized() && this.rawImageService.dataInitialized() && this.stopReporterService.dataInitialized();
	}

	getDisplays() {
		return this.displayService.data();
	}

	uploadToDevice() {
		this.dialogService.openUploadToDeviceDialog.emit();
	}

	openRawImageManager() {
		this.dialogService.openRawImageManagerDialog.emit();
	}

	private updateMenuItems() {
		this.menuItems.forEach(menuItem => menuItem.label = this.translocoService.translate(menuItem.id ?? ""));
		this.languageMenuItems.forEach(menuItem => menuItem.iconStyle = this.translocoService.getActiveLang() === menuItem.id ? {} : {color: "transparent"});
	}

	private updateThemeMenuIcon() {
		this.themeMenuItem.icon = this.themeService.darkTheme() ? PrimeIcons.SUN : PrimeIcons.MOON;
	}
}
