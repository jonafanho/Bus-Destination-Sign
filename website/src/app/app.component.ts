import {Component} from "@angular/core";
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
import {DialogModule} from "primeng/dialog";
import {DisplayService} from "./service/display.service";
import {RawImageService} from "./service/raw-image.service";
import {StopReporterService} from "./service/stop-reporter.service";
import {FileInputComponent} from "./component/file-input/file-input.component";
import {ImageGalleryComponent} from "./component/image-gallery/image-gallery.component";

@Component({
	selector: "app-root",
	imports: [
		ProgressSpinnerModule,
		ButtonModule,
		TooltipModule,
		TieredMenuModule,
		DialogModule,
		DisplayConfigComponent,
		TranslocoDirective,
		FileInputComponent,
		ImageGalleryComponent,
	],
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.css"],
})
export class AppComponent {
	readonly menuItems: MenuItem[];
	readonly themeMenuItem: MenuItem = {
		id: "menu.toggle-theme", command: () => {
			this.themeService.setTheme(!this.themeService.isDarkTheme());
			this.updateThemeMenuIcon();
		},
	};
	private readonly languageMenuItems: MenuItem[];

	protected rawImageManagerDialogVisible = false;

	constructor(private readonly displayService: DisplayService, private readonly rawImageService: RawImageService, private readonly stopReporterService: StopReporterService, private readonly themeService: ThemeService, private readonly translocoService: TranslocoService, langService: LangService) {
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
		return this.displayService.getDataInitialized() && this.rawImageService.getDataInitialized() && this.stopReporterService.getDataInitialized();
	}

	getDisplays() {
		return this.displayService.getData();
	}

	refreshRawImages() {
		this.rawImageService.fetchData();
	}

	deleteRawImage(rawImageId: string) {
		this.rawImageService.deleteRawImage(rawImageId);
	}

	private updateMenuItems() {
		this.menuItems.forEach(menuItem => menuItem.label = this.translocoService.translate(menuItem.id ?? ""));
		this.languageMenuItems.forEach(menuItem => menuItem.iconStyle = this.translocoService.getActiveLang() === menuItem.id ? {} : {color: "transparent"});
	}

	private updateThemeMenuIcon() {
		this.themeMenuItem.icon = this.themeService.isDarkTheme() ? PrimeIcons.SUN : PrimeIcons.MOON;
	}
}
