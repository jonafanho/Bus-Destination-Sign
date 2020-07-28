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

		componentDidUpdate() {
			Object.keys(DISPLAYS).map(key => {
				const selectedDisplay = this.getSelectedGroup()[key];
				[...Array(selectedDisplay.length)].map((u, index) => {
					const image = new Image();
					image.onload = () => {
						const newImageData = getImageData(DISPLAYS[key]["height"], DISPLAYS[key]["width"], selectedDisplay[index]["settings"], 1, image);
						document.querySelector(`#${key}_${index}_canvas`).getContext("2d").putImageData(newImageData, 0, 0);
					}
					image.src = selectedDisplay[index]["src"];
				});
			});
		}

		addGroup(event) {
			const currentGroups = this.state.groups;
			const groupObject = {name: "Group " + currentGroups.length};
			Object.keys(DISPLAYS).map(key => groupObject[key] = []);
			currentGroups.push(groupObject);
			this.setState({
				groups: currentGroups,
				selected_group: currentGroups.length - 1,
				selected_image: {display: Object.keys(DISPLAYS)[0], index: -1}
			});
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
					const displayList = this.getSelectedGroup()[name];
					displayList.push({src: progressEvent.target.result, settings: Object.assign({}, IMAGE_SETTINGS)});
					this.changeValue(name, displayList);
				};
				reader.readAsDataURL(fileList[0]);
			}
		}

		imageChanged(event) {
			this.componentDidUpdate();
		}

		getSelectedGroup() {
			return this.state.groups[this.state.selected_group];
		}

		getSelectedImage() {
			const {display, index} = this.state.selected_image;
			const selectedGroup = this.getSelectedGroup();
			if (selectedGroup) {
				return selectedGroup[display][index];
			} else {
				return undefined;
			}
		}

		render() {
			const selectedGroup = this.getSelectedGroup();
			const {display, index} = this.state.selected_image;
			const selectedImage = this.getSelectedImage();
			return (
				<div className="row">
					<div className="menu">
						{[...Array(this.state.groups.length)].map((u, groupIndex) => {
							const displayName = getArray("name", this.state.groups[groupIndex], "");
							return (
								<h2
									key={groupIndex}
									className={`tab ${this.state.selected_group === groupIndex ? "selected" : ""}`}
									id={`tab_${groupIndex}`}
									onClick={this.selectGroup}
								>{displayName === "" ? `Group ${groupIndex}` : displayName}</h2>
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
										const displayObject = DISPLAYS[key];
										return (
											<tr key={key} className="bottom_line">
												<td className="min_width_4">
													<h2>{displayObject["name"]}</h2>{displayObject["width"]} &#215; {displayObject["height"]}
												</td>
												<td className="fill_width">
													<div className="scroll_box">
														{[...Array(getArray(key, selectedGroup, []).length)].map((u, imageIndex) =>
															<div
																key={imageIndex}
																className={`canvas_box selectable ${display === key && index === imageIndex ? "selected" : ""}`}
															>
																<canvas
																	className="all_borders"
																	id={`${key}_${imageIndex}_canvas`}
																	height={displayObject["height"]}
																	width={displayObject["width"]}
																	onClick={(event) => this.selectImage(key, imageIndex, event)}
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
									hidden={index === -1}
									src={getArray("src", selectedImage, "")}
									settings={getArray("settings", selectedImage, Object.assign({}, IMAGE_SETTINGS))}
									height={DISPLAYS[display]["height"]}
									width={DISPLAYS[display]["width"]}
									selectedDisplay={Object.keys(DISPLAYS).indexOf(display)}
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
			this.state = {zoom: 3, image: null, test_disabled: false};
		}

		drawImageBitArray(callback) {
			const {height, width, src, settings} = this.props;
			const image = new Image();
			image.onload = () => {
				this.setState({image: image});
				callback(getImageBitArray(height, width, settings, image), this);
			}
			image.src = src;
		}

		sendImagePost(imageData, context) {
			context.setState({test_disabled: true});
			const {height, width, selectedDisplay} = context.props;
			let bitArray = "";
			for (let row = 0; row < height; row += 8) {
				for (let column = 0; column < width; column++) {
					for (let j = 0; j < 8; j += 4) {
						let sum = 0;
						for (let i = 0; i < 4; i++) {
							sum += (imageData[column + (i + j) * width + row * width] << i);
						}
						bitArray += sum.toString(16);
					}
				}
			}
			fetch(`/test?display=${selectedDisplay}`, {
				method: "POST",
				body: bitArray,
				headers: {
					"Content-type": "application/json; charset=UTF-8"
				}
			}).then(response => response.json()).then(data => {
				context.setState({test_disabled: false});
			});
		}

		drawCanvas(imageData, context) {
			const {height, width} = context.props;
			const zoomedImageData = getZoomedImageData(imageData, height, width, context.state.zoom);
			document.querySelector("#canvas_edited").getContext("2d").putImageData(zoomedImageData, 0, 0);
		}

		updateZoom(zoom) {
			this.setState({zoom: zoom});
			this.drawImageBitArray(this.drawCanvas);
		}

		updateImageSettings(parameter, value) {
			const {settings, onChange} = this.props;
			settings[parameter] = value;
			onChange();
			this.drawImageBitArray(this.drawCanvas);
		}

		render() {
			const {hidden, height, width, settings, src} = this.props;
			const scale = settings["scale_down"] / settings["scale_up"];
			const horizontalOffsetMax = Math.ceil((getArray("width", this.state.image, 0) + width * scale) / 2);
			const verticalOffsetMax = Math.ceil((getArray("height", this.state.image, 0) + height * scale) / 2);
			const zoom = this.state.zoom;
			return (
				<div hidden={hidden}>
					<img src={src} height={height * zoom + (zoom === 1 ? 2 : 1)} alt="Source Image"/>
					&nbsp;
					<div className="scroll_box canvas_box">
						<canvas
							className={zoom > 1 ? "extra_borders" : "all_borders"}
							id="canvas_edited"
							height={height * zoom}
							width={width * zoom}
						/>
					</div>
					<input
						className="input_button"
						type="submit"
						value="Test"
						disabled={this.state.test_disabled}
						onClick={() => this.drawImageBitArray(this.sendImagePost)}
					/>
					<br/>
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
							max={height}
							default={IMAGE_SETTINGS["crop_top"]}
							value={settings["crop_top"]}
							onChange={(value) => this.updateImageSettings("crop_top", value)}
						/>
						<Slider
							id="crop_right"
							title="Crop Right"
							min={0}
							max={width}
							default={IMAGE_SETTINGS["crop_right"]}
							value={settings["crop_right"]}
							onChange={(value) => this.updateImageSettings("crop_right", value)}
						/>
						<Slider
							id="crop_bottom"
							title="Crop Bottom"
							min={0}
							max={height}
							default={IMAGE_SETTINGS["crop_bottom"]}
							value={settings["crop_bottom"]}
							onChange={(value) => this.updateImageSettings("crop_bottom", value)}
						/>
						<Slider
							id="crop_left"
							className="bottom_line"
							title="Crop Left"
							min={0}
							max={width}
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
							onChange={(value) => this.updateZoom(value)}
						/>
						</tbody>
					</table>
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

function getImageBitArray(height, width, settings, image) {
	const scale = settings["scale_down"] / settings["scale_up"];
	const scaleHeight = Math.floor(height * scale);
	const scaleWidth = Math.floor(width * scale);
	const canvasContext = new OffscreenCanvas(image.width, image.height).getContext("2d");
	canvasContext.drawImage(image, 0, 0);
	const oldImageData = canvasContext.getImageData(settings["x"] + (image.width - scaleWidth) / 2, settings["y"] + (image.height - scaleHeight) / 2, scaleWidth, scaleHeight)["data"];
	const newBitArray = [];
	for (let row = 0; row < height; row++) {
		for (let column = 0; column < width; column++) {
			let color;
			if (row < settings["crop_top"] || row >= height - settings["crop_bottom"] || column < settings["crop_left"] || column >= width - settings["crop_right"]) {
				color = 0;
			} else {
				const index = (Math.floor(row * scale) * scaleWidth + Math.floor(column * scale)) * 4;
				color = oldImageData[index] + oldImageData[index + 1] + oldImageData[index + 2] >= settings["threshold"] * 3 ? 1 : 0;
			}
			newBitArray.push(color);
		}
	}
	return newBitArray;
}

function getZoomedImageData(oldBitArray, height, width, zoom) {
	const zoomHeight = height * zoom;
	const zoomWidth = width * zoom;
	const newImageData = new ImageData(zoomWidth, zoomHeight);
	for (let row = 0; row < zoomHeight; row++) {
		for (let column = 0; column < zoomWidth; column++) {
			const actualRow = row / zoom;
			const actualColumn = column / zoom;
			let color;
			if (zoom > 1 && (row % zoom === 0 || column % zoom === 0)) {
				color = 0;
			} else {
				color = oldBitArray[Math.floor(actualRow) * width + Math.floor(actualColumn)] * 255;
			}
			const index = (row * zoomWidth + column) * 4;
			newImageData.data[index] = color;
			newImageData.data[index + 1] = color;
			newImageData.data[index + 2] = color;
			newImageData.data[index + 3] = 255;
		}
	}
	return newImageData;
}

function getImageData(height, width, settings, zoom, image) {
	return getZoomedImageData(getImageBitArray(height, width, settings, image), height, width, zoom);
}

function getArray(key, array, defaultValue) {
	if (array && key in array) {
		return array[key];
	} else {
		return defaultValue;
	}
}

setup();