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
			this.state = {file: "", height: 0, width: 0, x: 0, y: 0, scale: 1, threshold: 128};
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
			const canvasHeight = this.props["height"];
			const canvasWidth = this.props["width"];
			const canvasContext = document.querySelector("#canvas_hidden").getContext("2d");
			const image = new Image();
			image.onload = () => {
				this.setState({height: image.height, width: image.width});
				canvasContext.drawImage(image, 0, 0);
				const imgData = canvasContext.getImageData(this.state.x, this.state.y, canvasWidth, canvasHeight);
				for (let i = 0; i < imgData.data.length; i += 4) {
					const color = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) > this.state.threshold * 3 ? 255 : 0;
					imgData.data[i] = color;
					imgData.data[i + 1] = color;
					imgData.data[i + 2] = color;
					imgData.data[i + 3] = 255;
				}
				document.querySelector("#canvas_edited").getContext("2d").putImageData(imgData, 0, 0);
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
							min={0}
							max={this.state.width - this.props["width"]}
							default={0}
							onChange={(value) => this.updateImageParameter("x", value)}
						/>
						<Slider
							title="Y Offset"
							min={0}
							max={this.state.height - this.props["height"]}
							default={0}
							onChange={(value) => this.updateImageParameter("y", value)}
						/>
						<br/>
						<canvas
							hidden
							id="canvas_hidden"
							height={this.state.height}
							width={this.state.width}
						/>
						<canvas id="canvas_edited" height={this.props["height"]} width={this.props["width"]}/>
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
			const valueString = event.target.value.toString().replace(/[^0-9]/g, "");
			const value = valueString === "" ? this.props["min"] - 1 : Math.min(Math.max(parseInt(valueString), this.props["min"]), this.props["max"]);
			this.setState({value: value});
			this.props["onChange"](Math.max(value, this.props["min"]));
		}

		render() {
			return (
				<div>
					<h2>{this.props["title"]}</h2>
					<input
						className="input_text"
						type="text"
						value={this.state.value < this.props["min"] ? "" : this.state.value}
						onChange={this.updateValue}
						placeholder={this.props["min"]}
					/>
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