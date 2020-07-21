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
			this.state = {
				file: "",
				height: 0,
				width: 0,
				x: 0,
				y: 0,
				scale_up: 1,
				scale_down: 1,
				threshold: 128,
				zoom: 3
			};
		}

		uploadImage(event) {
			const fileList = document.querySelector("#button_upload").files;
			if (fileList.length > 0) {
				const reader = new FileReader();
				reader.onload = (progressEvent) => {
					this.setState({file: progressEvent.target.result});
					this.updateImage();
				};
				reader.readAsDataURL(fileList[0]);
			} else {
				this.setState({file: ""});
			}
		}

		updateImageParameter(parameter, value) {
			const updateDictionary = {};
			updateDictionary[parameter] = value;
			this.setState(updateDictionary);
			this.updateImage();
		}

		updateImage() {
			const height = this.props["height"];
			const width = this.props["width"];
			const image = new Image();
			image.onload = () => {
				this.setState({height: image.height, width: image.width});
				const canvasContext = new OffscreenCanvas(image.width, image.height).getContext("2d");
				canvasContext.drawImage(image, 0, 0);
				const scale = this.state.scale_down / this.state.scale_up;
				const scaleHeight = Math.floor(height * scale);
				const scaleWidth = Math.floor(width * scale);
				const oldImageData = canvasContext.getImageData(this.state.x + (image.width - scaleWidth) / 2, this.state.y + (image.height - scaleHeight) / 2, scaleWidth, scaleHeight);
				const zoom = this.state.zoom;
				const zoomHeight = height * zoom;
				const zoomWidth = width * zoom;
				const newImageData = new ImageData(zoomWidth, zoomHeight);
				for (let row = 0; row <= zoomHeight; row++) {
					for (let column = 0; column <= zoomWidth; column++) {
						let color;
						if (zoom > 1 && (row % zoom === 0 || column % zoom === 0)) {
							color = 0;
						} else {
							const index = (Math.floor(Math.floor(row / zoom) * scale) * scaleWidth + Math.floor(Math.floor(column / zoom) * scale)) * 4;
							color = oldImageData.data[index] + oldImageData.data[index + 1] + oldImageData.data[index + 2] > this.state.threshold * 3 ? 255 : 0;
						}
						const index = (row * zoomWidth + column) * 4;
						newImageData.data[index] = color;
						newImageData.data[index + 1] = color;
						newImageData.data[index + 2] = color;
						newImageData.data[index + 3] = 255;
					}
				}
				document.querySelector("#canvas_edited").getContext("2d").putImageData(newImageData, 0, 0);
			};
			image.src = this.state.file;
		}

		render() {
			return (
				<div>
					<input type="file" id="button_upload" accept="image/*" name="filename"/>
					<label htmlFor="button_upload">Choose an Image</label>
					<br/>
					<input className="input_button" type="submit" onClick={this.uploadImage}/>
					<br/>
					<div hidden={this.state.file === ""}>
						<img src={this.state.file} alt="Source Image"/>
						<br/>
						<Slider
							title="Threshold"
							min={0}
							max={255}
							default={128}
							onChange={(value) => this.updateImageParameter("threshold", value)}
						/>
						<Slider
							title="X Offset"
							min={-Math.ceil(this.state.width / 2)}
							max={Math.ceil(this.state.width / 2)}
							default={0}
							onChange={(value) => this.updateImageParameter("x", value)}
						/>
						<Slider
							title="Y Offset"
							min={-Math.ceil(this.state.height / 2)}
							max={Math.ceil(this.state.height / 2)}
							default={0}
							onChange={(value) => this.updateImageParameter("y", value)}
						/>
						<Slider
							title="Scale Up"
							min={1}
							max={10}
							default={1}
							onChange={(value) => this.updateImageParameter("scale_up", value)}
						/>
						<Slider
							title="Scale Down"
							min={1}
							max={10}
							default={1}
							onChange={(value) => this.updateImageParameter("scale_down", value)}
						/>
						<Slider
							title="Zoom"
							min={1}
							max={10}
							default={3}
							onChange={(value) => this.updateImageParameter("zoom", value)}
						/>
						<br/>
						<canvas
							id="canvas_edited"
							height={this.props["height"] * this.state.zoom}
							width={this.props["width"] * this.state.zoom}
						/>
						<br/>
					</div>
				</div>
			);
		}
	}

	class Slider extends React.Component {

		constructor(props) {
			super(props);
			this.updateValue = this.updateValue.bind(this);
			this.state = {value: props["default"]};
		}

		updateValue(event) {
			const value = event.target.value;
			this.setState({value: value});
			this.props["onChange"](parseInt(value));
		}

		render() {
			return (
				<div>
					<h2>{this.props["title"]}</h2>
					<p>{this.state.value}</p>
					<input
						type="range"
						min={this.props["min"]}
						max={this.props["max"]}
						value={this.state.value}
						onChange={this.updateValue}
					/>
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