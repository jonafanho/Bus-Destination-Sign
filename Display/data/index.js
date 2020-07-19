const FRONT_HEIGHT = 64;
const FRONT_WIDTH = 256;
const SIDE_HEIGHT = 64;
const SIDE_WIDTH = 256;
const BACK_HEIGHT = 64;
const BACK_WIDTH = 128;

function setup() {
	"use strict";

	class MainScreen extends React.Component {

		constructor(props) {
			super(props);
			this.addDisplay = this.addDisplay.bind(this);
			this.selectDisplay = this.selectDisplay.bind(this);
			this.renameDisplay = this.renameDisplay.bind(this);
			this.state = {displays: [], selected: -1};
		}

		addDisplay(event) {
			const currentDisplays = this.state.displays;
			currentDisplays.push({
				name: "Group " + currentDisplays.length,
				front_images: [],
				side_images: [],
				back_images: [],
			})
			this.setState({displays: currentDisplays, selected: currentDisplays.length - 1});
		}

		selectDisplay(event) {
			this.setState({selected: parseInt(event.target.id.replace(/tab_/g, ""))});
		}

		renameDisplay(event) {
			this.changeValue("name", event.target.value);
		}

		changeValue(name, value) {
			const currentDisplays = this.state.displays;
			currentDisplays[this.state.selected][name] = value;
			this.setState({displays: currentDisplays});
		}

		render() {
			const selectedDisplay = this.state.displays[this.state.selected];
			return (
				<div className="row">
					<div className="menu">
						{[...Array(this.state.displays.length)].map((u, index) => {
							const displayName = getArray("name", this.state.displays[index], "");
							return (
								<h2
									key={index}
									className={`tab ${this.state.selected === index ? "selected" : ""}`}
									id={`tab_${index}`}
									onClick={this.selectDisplay}
								>{displayName === "" ? `Group ${index}` : displayName}</h2>
							);
						})}
						<h2 className="tab" onClick={this.addDisplay}>+</h2>
					</div>
					<div className="content">
						<div hidden={this.state.selected !== -1}>
							<h1>Let's get started with your Bus Destination Sign.</h1>
							<p>Add a display group using the + button on the left.</p>
						</div>
						<div hidden={this.state.selected === -1}>
							<label>
								<input
									id="input_name"
									className="input_text"
									type="text"
									value={getArray("name", selectedDisplay, "")}
									onChange={this.renameDisplay}
									placeholder="Name"
									maxLength="20"
								/>
							</label>
							<ImageUploader height={FRONT_HEIGHT} width={FRONT_WIDTH}/>
						</div>
					</div>
				</div>
			);
		}
	}

	class ImageUploader extends React.Component {

		constructor(props) {
			super(props);
			this.uploadImage = this.uploadImage.bind(this);
			this.state = {file: ""};
		}

		uploadImage(event) {
			const canvasHeight = this.props.height;
			const canvasWidth = this.props.width;
			const fileList = document.querySelector("#image_upload").files;
			if (fileList.length > 0) {
				const reader = new FileReader();
				reader.onload = (e) => {
					this.setState({file: e.target.result});
					const canvasContext = document.querySelector("#image_canvas").getContext("2d");
					const image = new Image();
					image.onload = () => {
						canvasContext.drawImage(image, 0, 0);
						const imgData = canvasContext.getImageData(0, 0, canvasWidth, canvasHeight);
						for (let i = 0; i < imgData.data.length; i += 4) {
							const color = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
							imgData.data[i] = color;
							imgData.data[i + 1] = color;
							imgData.data[i + 2] = color;
							imgData.data[i + 3] = 255;
						}
						canvasContext.putImageData(imgData, 0, 0);
					};
					image.src = e.target.result;
				};
				reader.readAsDataURL(fileList[0]);
			} else {
				this.setState({file: ""});
			}
		}

		render() {
			return (
				<div>
					<input type="file" id="image_upload" accept="image/*" name="filename"/>
					<label htmlFor="image_upload">Choose an Image</label>
					<br/>
					<input className="input_button" type="submit" onClick={this.uploadImage}/>
					<br/>
					<img hidden={this.state.file === ""} id="image_preview" src={this.state.file} alt="Source Image"/>
					<br/>
					<canvas hidden={this.state.file === ""} id="image_canvas" height={this.props.height}
							width={this.props.width}/>
				</div>
			);
		}
	}

	if (window.location.pathname !== "/") {
		window.location.pathname = "/";
	}
	ReactDOM.render(<MainScreen/>, document.querySelector("#react-root"));
}

function getArray(key, array, defaultValue) {
	if (array && key in array) {
		return array[key];
	} else {
		return defaultValue;
	}
}

setup();