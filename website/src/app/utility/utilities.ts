export function getUrl() {
	if (document.location.hostname === "localhost") {
		return "http://localhost:8080/";
	} else {
		return "";
	}
}
