const DISPLAYS = {
	front: {
		name: "Front",
		height: 64,
		width: 256,
	},
	side: {
		name: "Side",
		height: 64,
		width: 256,
	},
	back: {
		name: "Back",
		height: 64,
		width: 128,
	}
}

const IMAGE_SETTINGS = {
	x: 0,
	y: 0,
	scale_up: 1,
	scale_down: 1,
	threshold: 128,
	crop_top: 0,
	crop_right: 0,
	crop_bottom: 0,
	crop_left: 0,
};

const EXAMPLE_STATE = {
	groups: [
		{
			name: "Group 0",
			front: [
				{
					src: "base64",
					settings: {
						x: 0,
						y: 0,
						scale_up: 1,
						scale_down: 1,
						threshold: 128,
						crop_top: 0,
						crop_right: 0,
						crop_bottom: 0,
						crop_left: 0,
					}
				},
				{}
			],
			side: [],
			back: []
		},
		{
			name: "Group 1",
			front: [],
			side: [],
			back: []
		}
	],
	selected_group: 0,
	selected_image: {
		display: "front",
		index: 0
	}
}

function setup() {
	"use strict";

	class MainScreen extends React.Component {

		constructor(props) {
			super(props);
			this.addGroup = this.addGroup.bind(this);
			this.selectGroup = this.selectGroup.bind(this);
			this.renameGroup = this.renameGroup.bind(this);
			this.selectImage = this.selectImage.bind(this);
			this.uploadImage = this.uploadImage.bind(this);
			this.imageChanged = this.imageChanged.bind(this);
			this.state = {
				groups: [],
				selected_group: -1,
				selected_image: {display: Object.keys(DISPLAYS)[0], index: -1}
			};
		}

		addGroup(event) {
			const currentGroups = this.state.groups;
			const groupObject = {name: "Group " + currentGroups.length};
			Object.keys(DISPLAYS).map(key => groupObject[key] = []);
			currentGroups.push(groupObject);
			this.setState({groups: currentGroups, selected_group: currentGroups.length - 1});
		}

		selectGroup(event) {
			this.setState({
				selected_group: parseInt(event.target.id.replace(/tab_/g, "")),
				selected_image: {display: Object.keys(DISPLAYS)[0], index: -1}
			});
		}

		renameGroup(event) {
			this.changeValue("name", event.target.value);
		}

		selectImage(display, index, event) {
			this.setState({selected_image: {display: display, index: index}});
		}

		changeValue(name, value) {
			const currentGroups = this.state.groups;
			currentGroups[this.state.selected_group][name] = value;
			this.setState({groups: currentGroups});
		}

		uploadImage(event) {
			const fileList = document.querySelector(`#${event.target.id}`).files;
			const name = event.target.id.replace(/button_upload_/g, "");
			if (fileList.length > 0) {
				const reader = new FileReader();
				reader.onload = (progressEvent) => {
					const displayList = this.state.groups[this.state.selected_group][name];
					displayList.push({src: progressEvent.target.result, settings: Object.assign({}, IMAGE_SETTINGS)});
					this.changeValue(name, displayList);
				};
				reader.readAsDataURL(fileList[0]);
			}
		}

		imageChanged(newImageData, event) {
			const selectedImage = this.state.selected_image;
			const name = selectedImage["display"];
			const canvas = document.querySelector(`#${name}_${selectedImage["index"]}`);
			if (canvas) {
				canvas.getContext("2d").putImageData(newImageData, 0, 0);
			}
		}

		render() {
			const selectedGroup = this.state.groups[this.state.selected_group];
			const selectedDisplay = this.state.selected_image["display"];
			const selectedImage = getArray(this.state.selected_image["index"], getArray(selectedDisplay, selectedGroup, []), {});
			return (
				<div className="row">
					<div className="menu">
						{[...Array(this.state.groups.length)].map((u, index) => {
							const displayName = getArray("name", this.state.groups[index], "");
							return (
								<h2
									key={index}
									className={`tab ${this.state.selected_group === index ? "selected" : ""}`}
									id={`tab_${index}`}
									onClick={this.selectGroup}
								>{displayName === "" ? `Group ${index}` : displayName}</h2>
							);
						})}
						<h2 className="tab" onClick={this.addGroup}>+</h2>
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
										value={getArray("name", selectedGroup, "")}
										onChange={this.renameGroup}
										placeholder="Name"
									/>
								</label>
								<br/>
								<table>
									<tbody>
									{Object.keys(DISPLAYS).map(key => {
										const display = DISPLAYS[key];
										return (
											<tr key={key} className="bottom_line">
												<td className="min_width_4">
													<h2>{display["name"]}</h2>{display["width"]} &#215; {display["height"]}
												</td>
												<td className="fill_width">
													<div className="scroll_box">
														{[...Array(getArray(key, selectedGroup, []).length)].map((u, index) =>
															<div key={index} className="canvas_box">
																<canvas
																	className="all_borders"
																	id={`${key}_${index}`}
																	height={display["height"]}
																	width={display["width"]}
																	onClick={(event) => this.selectImage(key, index, event)}
																/>
															</div>
														)}
													</div>
												</td>
												<td>
													<UploadButton
														id={`button_upload_${key}`}
														onChange={this.uploadImage}
													/>
												</td>
											</tr>
										);
									})}
									</tbody>
								</table>
								<br/>
								<ImageEditor
									src={getArray("src", selectedImage, "")}
									settings={getArray("settings", selectedImage, Object.assign({}, IMAGE_SETTINGS))}
									height={DISPLAYS[selectedDisplay]["height"]}
									width={DISPLAYS[selectedDisplay]["width"]}
									onChange={this.imageChanged}
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
				zoom: 3
			};
		}

		componentDidUpdate() {
			if (this.state.canvas_context) {
				const height = this.props["height"];
				const width = this.props["width"];
				const settings = this.props["settings"];
				const scale = settings["scale_down"] / settings["scale_up"];
				const scaleHeight = Math.floor(height * scale);
				const scaleWidth = Math.floor(width * scale);
				const oldImageData = this.state.canvas_context.getImageData(settings["x"] + (this.state.width - scaleWidth) / 2, settings["y"] + (this.state.height - scaleHeight) / 2, scaleWidth, scaleHeight);
				const zoom = this.state.zoom;
				const zoomHeight = height * zoom;
				const zoomWidth = width * zoom;
				const newImageData = new ImageData(zoomWidth, zoomHeight);
				const newImageDataSmall = new ImageData(width, height);
				for (let row = 0; row <= zoomHeight; row++) {
					for (let column = 0; column <= zoomWidth; column++) {
						const actualRow = row / zoom;
						const actualColumn = column / zoom;
						let color;
						if (zoom > 1 && (row % zoom === 0 || column % zoom === 0) || actualRow < settings["crop_top"] || actualRow > height - settings["crop_bottom"] || actualColumn < settings["crop_left"] || actualColumn > width - settings["crop_right"]) {
							color = 0;
						} else {
							const index = (Math.floor(Math.floor(actualRow) * scale) * scaleWidth + Math.floor(Math.floor(actualColumn) * scale)) * 4;
							color = oldImageData.data[index] + oldImageData.data[index + 1] + oldImageData.data[index + 2] >= settings["threshold"] * 3 ? 255 : 0;
						}
						const index = (row * zoomWidth + column) * 4;
						newImageData.data[index] = color;
						newImageData.data[index + 1] = color;
						newImageData.data[index + 2] = color;
						newImageData.data[index + 3] = 255;
						if (zoom === 1 || (row % zoom === 1 && column % zoom === 1)) {
							const indexSmall = (Math.floor(row / zoom) * width + Math.floor(column / zoom)) * 4;
							newImageDataSmall.data[indexSmall] = color;
							newImageDataSmall.data[indexSmall + 1] = color;
							newImageDataSmall.data[indexSmall + 2] = color;
							newImageDataSmall.data[indexSmall + 3] = 255;
						}
					}
				}
				this.props["onChange"](newImageDataSmall);
				document.querySelector("#canvas_edited").getContext("2d").putImageData(newImageData, 0, 0);
			}
		}

		loadImage(event) {
			const image = event.target;
			const canvasContext = new OffscreenCanvas(image.width, image.height).getContext("2d");
			canvasContext.drawImage(image, 0, 0);
			this.setState({height: image.height, width: image.width, canvas_context: canvasContext});
		}

		updateImageState(parameter, value) {
			const updateDictionary = {};
			updateDictionary[parameter] = value;
			this.setState(updateDictionary);
		}

		updateImageSettings(parameter, value) {
			this.props["settings"][parameter] = value;
			this.setState({});
		}

		render() {
			const settings = this.props["settings"];
			const scale = settings["scale_down"] / settings["scale_up"];
			const horizontalOffsetMax = Math.ceil((this.state.width + this.props["width"] * scale) / 2);
			const verticalOffsetMax = Math.ceil((this.state.height + this.props["height"] * scale) / 2);
			const file = this.props["src"];
			const zoom = this.state.zoom;
			return (
				<div hidden={file === ""}>
					<img hidden src={file} alt="Source Image" onLoad={this.loadImage}/>
					<img src={file} alt="Source Image"/>
					<table>
						<tbody>
						<Slider
							id="slider_threshold"
							className="bottom_line"
							title="Threshold"
							min={0}
							max={256}
							default={IMAGE_SETTINGS["threshold"]}
							value={settings["threshold"]}
							onChange={(value) => this.updateImageSettings("threshold", value)}
						/>
						<Slider
							id="slider_scale_up"
							title="Scale Up"
							min={1}
							max={30}
							default={IMAGE_SETTINGS["scale_up"]}
							value={settings["scale_up"]}
							onChange={(value) => this.updateImageSettings("scale_up", value)}
						/>
						<Slider
							id="slider_scale_down"
							className="bottom_line"
							title="Scale Down"
							min={1}
							max={30}
							default={IMAGE_SETTINGS["scale_down"]}
							value={settings["scale_down"]}
							onChange={(value) => this.updateImageSettings("scale_down", value)}
						/>
						<Slider
							id="slider_x"
							title="Horizontal Offset"
							min={-horizontalOffsetMax}
							max={horizontalOffsetMax}
							default={IMAGE_SETTINGS["x"]}
							value={settings["x"]}
							onChange={(value) => this.updateImageSettings("x", value)}
						/>
						<Slider
							id="slider_y"
							className="bottom_line"
							title="Vertical Offset"
							min={-verticalOffsetMax}
							max={verticalOffsetMax}
							default={IMAGE_SETTINGS["y"]}
							value={settings["y"]}
							onChange={(value) => this.updateImageSettings("y", value)}
						/>
						<Slider
							id="crop_top"
							title="Crop Top"
							min={0}
							max={this.props["height"]}
							default={IMAGE_SETTINGS["crop_top"]}
							value={settings["crop_top"]}
							onChange={(value) => this.updateImageSettings("crop_top", value)}
						/>
						<Slider
							id="crop_right"
							title="Crop Right"
							min={0}
							max={this.props["width"]}
							default={IMAGE_SETTINGS["crop_right"]}
							value={settings["crop_right"]}
							onChange={(value) => this.updateImageSettings("crop_right", value)}
						/>
						<Slider
							id="crop_bottom"
							title="Crop Bottom"
							min={0}
							max={this.props["height"]}
							default={IMAGE_SETTINGS["crop_bottom"]}
							value={settings["crop_bottom"]}
							onChange={(value) => this.updateImageSettings("crop_bottom", value)}
						/>
						<Slider
							id="crop_left"
							className="bottom_line"
							title="Crop Left"
							min={0}
							max={this.props["width"]}
							default={IMAGE_SETTINGS["crop_left"]}
							value={settings["crop_left"]}
							onChange={(value) => this.updateImageSettings("crop_left", value)}
						/>
						<Slider
							id="slider_zoom"
							className="bottom_line"
							title="Zoom"
							min={1}
							max={10}
							default={3}
							value={this.state.zoom}
							onChange={(value) => this.updateImageState("zoom", value)}
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

	function Slider(props) {

		function setValue(value) {
			props["onChange"](parseInt(value));
		}

		return (
			<tr className={props["className"]}>
				<td className="text_width">
					<label htmlFor={props["id"]}>{props["title"]}</label>
				</td>
				<td>
					<a
						className="no_underline"
						onClick={() => setValue(Math.max(props["value"] - 1, props["min"]))}
					>&#9664;</a>
				</td>
				<td className="fill_width">
					<input
						className="slider"
						type="range"
						id={props["id"]}
						min={props["min"]}
						max={props["max"]}
						value={props["value"]}
						onChange={(event) => setValue(event.target.value)}
					/>
				</td>
				<td>
					<a
						className="no_underline"
						onClick={() => setValue(Math.min(props["value"] + 1, props["max"]))}
					>&#9654;</a>
				</td>
				<td className="min_width_3"><p>{props["value"]}</p></td>
				<td className="min_width_3">
					<a
						className={props["value"] === props["default"] ? "disabled" : ""}
						onClick={() => setValue(props["default"])}
					>Reset</a>
				</td>
			</tr>
		);
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