import {Injectable} from "@angular/core";
import {getCookie, setCookie} from "../utility/utilities";

@Injectable({providedIn: "root"})
export class ThemeService {
	private darkTheme: boolean;

	constructor() {
		this.darkTheme = getCookie("dark_theme") === "true";
		this.setElementTag();
	}

	public setTheme(isDarkTheme: boolean) {
		this.darkTheme = isDarkTheme;
		this.setElementTag();
	}

	public isDarkTheme() {
		return this.darkTheme;
	}

	private setElementTag() {
		setCookie("dark_theme", this.darkTheme.toString());

		const element = document.querySelector("html");
		if (element) {
			element.classList.add(this.darkTheme ? "dark-theme" : "light-theme");
			element.classList.remove(this.darkTheme ? "light-theme" : "dark-theme");
		}
	}
}
