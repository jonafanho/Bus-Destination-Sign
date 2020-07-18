function setup() {
	"use strict";

	function MainScreen(props) {
		return (
			<div>
				hi
			</div>
		)
	}
	
	if (window.location.pathname !== "/") {
		window.location.pathname = "/";
	}
	ReactDOM.render(<MainScreen/>, document.querySelector("#react-root"));
}

setup();