export function getCookie(name: string) {
	const splitCookies = document.cookie.split("; ").filter(cookie => cookie.startsWith(name + "="));
	if (splitCookies.length > 0 && splitCookies[0].includes("=")) {
		return decodeURIComponent(splitCookies[0].split("=")[1]);
	} else {
		return "";
	}
}

export function setCookie(name: string, value: string) {
	document.cookie = `${name}=${value}; expires=${new Date(2999, 11, 31).toUTCString()}; path=/`;
}

export function getUrl() {
	if (document.location.hostname === "localhost") {
		return "http://localhost:8080/";
	} else {
		return "";
	}
}

export function getLanguageMapping(lang: string) {
	switch (lang) {
		case "en":
			return "English";
		case "zh":
			return "繁體中文";
		default:
			return lang;
	}
}
