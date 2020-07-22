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
			this.uploadImage = this.uploadImage.bind(this);
			this.state = {displays: [], selected_group: -1, selected_image: -1};
		}

		addDisplay(event) {
			const currentDisplays = this.state.displays;
			currentDisplays.push({
				name: "Group " + currentDisplays.length,
				front_images: [],
				side_images: [],
				back_images: [],
			})
			this.setState({displays: currentDisplays, selected_group: currentDisplays.length - 1});
		}

		selectDisplay(event) {
			this.setState({selected_group: parseInt(event.target.id.replace(/tab_/g, ""))});
		}

		renameDisplay(event) {
			this.changeValue("name", event.target.value);
		}

		changeValue(name, value) {
			const currentDisplays = this.state.displays;
			currentDisplays[this.state.selected_group][name] = value;
			this.setState({displays: currentDisplays});
		}

		uploadImage(event) {
			const fileList = document.querySelector(`#${event.target.id}`).files;
			const name = event.target.id.replace(/button_upload_/g, "");
			if (fileList.length > 0) {
				const reader = new FileReader();
				reader.onload = (progressEvent) => {
					const displayList = this.state.displays[this.state.selected_group][name];
					displayList.push(progressEvent.target.result);
					this.changeValue(name, displayList);
				};
				reader.readAsDataURL(fileList[0]);
			}
		}

		render() {
			const selectedDisplay = this.state.displays[this.state.selected_group];
			return (
				<div className="row">
					<div className="menu">
						{[...Array(this.state.displays.length)].map((u, index) => {
							const displayName = getArray("name", this.state.displays[index], "");
							return (
								<h2
									key={index}
									className={`tab ${this.state.selected_group === index ? "selected" : ""}`}
									id={`tab_${index}`}
									onClick={this.selectDisplay}
								>{displayName === "" ? `Group ${index}` : displayName}</h2>
							);
						})}
						<h2 className="tab" onClick={this.addDisplay}>+</h2>
					</div>
					<div className="content">
						{this.state.selected_group === -1 ?
							<div>
								<h1>Let's get started with your Bus Destination Sign.</h1>
								<p>Add a display group using the + button on the left.</p>
							</div> :
							<div>
								<label>
									<input
										id="input_name"
										className="input_text"
										type="text"
										value={getArray("name", selectedDisplay, "")}
										onChange={this.renameDisplay}
										placeholder="Name"
									/>
								</label>
								<br/>
								<table>
									<tbody>
									<tr className="bottom_line">
										<td className="min_width_4"><h2>Front</h2>256 &#215; 64</td>
										<td className="fill_width">
											<div className="scroll_box">
												{[...Array(getArray("front_images", selectedDisplay, []).length)].map((u, index) =>
													<canvas key={index} height={64} width={256}/>
												)}
											</div>
										</td>
										<td>
											<UploadButton
												id={"button_upload_front_images"}
												onChange={this.uploadImage}
											/>
										</td>
									</tr>
									<tr className="bottom_line">
										<td className="min_width_4"><h2>Side</h2>256 &#215; 64</td>
										<td className="fill_width">
											<div className="scroll_box">
												{[...Array(getArray("side_images", selectedDisplay, []).length)].map((u, index) =>
													<canvas key={index} height={64} width={256}/>
												)}
											</div>
										</td>
										<td>
											<UploadButton
												id={"button_upload_side_images"}
												onChange={this.uploadImage}
											/>
										</td>
									</tr>
									<tr className="bottom_line">
										<td className="min_width_4"><h2>Back</h2>128 &#215; 64</td>
										<td className="fill_width">
											<div className="scroll_box">
												{[...Array(getArray("back_images", selectedDisplay, []).length)].map((u, index) =>
													<canvas key={index} height={64} width={256}/>
												)}
											</div>
										</td>
										<td>
											<UploadButton
												id={"button_upload_back_images"}
												onChange={this.uploadImage}
											/>
										</td>
									</tr>
									</tbody>
								</table>
								<br/>
								<ImageEditor
									file={selectedDisplay["front_images"][0]}
									height={FRONT_HEIGHT}
									width={FRONT_WIDTH}
								/>
							</div>
						}
					</div>
				</div>
			);
		}
	}

	function UploadButton(props) {
		return (
			<div>
				<input
					className="input_file"
					type="file"
					id={props["id"]}
					accept="image/*"
					name="filename"
					onChange={props["onChange"]}
				/>
				<label htmlFor={props["id"]}>+</label>
			</div>
		)
	}

	class ImageEditor extends React.Component {

		constructor(props) {
			super(props);
			this.loadImage = this.loadImage.bind(this);
			this.state = {
				height: 0,
				width: 0,
				canvas_context: null,
				x: 0,
				y: 0,
				scale_up: 1,
				scale_down: 1,
				threshold: 128,
				crop_top: 0,
				crop_right: 0,
				crop_bottom: 0,
				crop_left: 0,
				zoom: 3
			};
		}

		componentDidUpdate() {
			if (this.state.canvas_context) {
				const height = this.props["height"];
				const width = this.props["width"];
				const scale = this.state.scale_down / this.state.scale_up;
				const scaleHeight = Math.floor(height * scale);
				const scaleWidth = Math.floor(width * scale);
				const oldImageData = this.state.canvas_context.getImageData(this.state.x + (this.state.width - scaleWidth) / 2, this.state.y + (this.state.height - scaleHeight) / 2, scaleWidth, scaleHeight);
				const zoom = this.state.zoom;
				const zoomHeight = height * zoom;
				const zoomWidth = width * zoom;
				const newImageData = new ImageData(zoomWidth, zoomHeight);
				for (let row = 0; row <= zoomHeight; row++) {
					for (let column = 0; column <= zoomWidth; column++) {
						const actualRow = row / zoom;
						const actualColumn = column / zoom;
						let color;
						if (zoom > 1 && (row % zoom === 0 || column % zoom === 0) || actualRow < this.state.crop_top || actualRow > height - this.state.crop_bottom || actualColumn < this.state.crop_left || actualColumn > width - this.state.crop_right) {
							color = 0;
						} else {
							const index = (Math.floor(Math.floor(actualRow) * scale) * scaleWidth + Math.floor(Math.floor(actualColumn) * scale)) * 4;
							color = oldImageData.data[index] + oldImageData.data[index + 1] + oldImageData.data[index + 2] >= this.state.threshold * 3 ? 255 : 0;
						}
						const index = (row * zoomWidth + column) * 4;
						newImageData.data[index] = color;
						newImageData.data[index + 1] = color;
						newImageData.data[index + 2] = color;
						newImageData.data[index + 3] = 255;
					}
				}
				document.querySelector("#canvas_edited").getContext("2d").putImageData(newImageData, 0, 0);
			}
		}

		loadImage(event) {
			const image = event.target;
			const canvasContext = new OffscreenCanvas(image.width, image.height).getContext("2d");
			canvasContext.drawImage(image, 0, 0);
			this.setState({height: image.height, width: image.width, canvas_context: canvasContext});
		}

		updateImageParameter(parameter, value) {
			const updateDictionary = {};
			updateDictionary[parameter] = value;
			this.setState(updateDictionary);
		}

		render() {
			const scale = this.state.scale_down / this.state.scale_up;
			const horizontalOffsetMax = Math.ceil((this.state.width + this.props["width"] * scale) / 2);
			const verticalOffsetMax = Math.ceil((this.state.height + this.props["height"] * scale) / 2);
			const file = this.props["file"];
			const zoom = this.state.zoom;
			return (
				<div hidden={file === ""}>
					<img src={file} alt="Source Image" onLoad={this.loadImage}/>
					<table>
						<tbody>
						<Slider
							id="slider_threshold"
							className="bottom_line"
							title="Threshold"
							min={0}
							max={256}
							default={128}
							onChange={(value) => this.updateImageParameter("threshold", value)}
						/>
						<Slider
							id="slider_scale_up"
							title="Scale Up"
							min={1}
							max={30}
							default={1}
							onChange={(value) => this.updateImageParameter("scale_up", value)}
						/>
						<Slider
							id="slider_scale_down"
							className="bottom_line"
							title="Scale Down"
							min={1}
							max={30}
							default={1}
							onChange={(value) => this.updateImageParameter("scale_down", value)}
						/>
						<Slider
							id="slider_x"
							title="Horizontal Offset"
							min={-horizontalOffsetMax}
							max={horizontalOffsetMax}
							default={0}
							onChange={(value) => this.updateImageParameter("x", value)}
						/>
						<Slider
							id="slider_y"
							className="bottom_line"
							title="Vertical Offset"
							min={-verticalOffsetMax}
							max={verticalOffsetMax}
							default={0}
							onChange={(value) => this.updateImageParameter("y", value)}
						/>
						<Slider
							id="crop_top"
							title="Crop Top"
							min={0}
							max={this.props["height"]}
							default={0}
							onChange={(value) => this.updateImageParameter("crop_top", value)}
						/>
						<Slider
							id="crop_right"
							title="Crop Right"
							min={0}
							max={this.props["width"]}
							default={0}
							onChange={(value) => this.updateImageParameter("crop_right", value)}
						/>
						<Slider
							id="crop_bottom"
							title="Crop Bottom"
							min={0}
							max={this.props["height"]}
							default={0}
							onChange={(value) => this.updateImageParameter("crop_bottom", value)}
						/>
						<Slider
							id="crop_left"
							className="bottom_line"
							title="Crop Left"
							min={0}
							max={this.props["width"]}
							default={0}
							onChange={(value) => this.updateImageParameter("crop_left", value)}
						/>
						<Slider
							id="slider_zoom"
							className="bottom_line"
							title="Zoom"
							min={1}
							max={10}
							default={3}
							onChange={(value) => this.updateImageParameter("zoom", value)}
						/>
						</tbody>
					</table>
					<br/>
					<div className="scroll_box canvas_box">
						<canvas
							className={zoom > 1 ? "extra_borders" : "all_borders"}
							id="canvas_edited"
							height={this.props["height"] * zoom}
							width={this.props["width"] * zoom}
						/>
					</div>
				</div>
			);
		}
	}

	class Slider extends React.Component {

		constructor(props) {
			super(props);
			this.updateValue = this.updateValue.bind(this);
			this.resetValue = this.resetValue.bind(this);
			this.incrementValue = this.incrementValue.bind(this);
			this.decrementValue = this.decrementValue.bind(this);
			this.state = {value: props["default"]};
		}

		updateValue(event) {
			this.setValue(event.target.value);
		}

		resetValue(event) {
			this.setValue(this.props["default"]);
		}

		incrementValue(event) {
			this.setValue(Math.min(parseInt(this.state.value) + 1, this.props["max"]));
		}

		decrementValue(event) {
			this.setValue(Math.max(parseInt(this.state.value) - 1, this.props["min"]));
		}

		setValue(value) {
			this.setState({value: value});
			this.props["onChange"](parseInt(value));
		}

		render() {
			return (
				<tr className={this.props["className"]}>
					<td className="text_width"><label htmlFor={this.props["id"]}>{this.props["title"]}</label></td>
					<td><a className="no_underline" onClick={this.decrementValue}>&#9664;</a></td>
					<td className="fill_width">
						<input
							className="slider"
							type="range"
							id={this.props["id"]}
							min={this.props["min"]}
							max={this.props["max"]}
							value={this.state.value}
							onChange={this.updateValue}
						/>
					</td>
					<td><a className="no_underline" onClick={this.incrementValue}>&#9654;</a></td>
					<td className="min_width_3"><p>{this.state.value}</p></td>
					<td className="min_width_3">
						<a
							className={parseInt(this.state.value) === this.props["default"] ? "disabled" : ""}
							onClick={this.resetValue}
						>Reset</a>
					</td>
				</tr>
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