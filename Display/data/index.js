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
	fancy_scroll: 0
};

const EXAMPLE_STATE = {
	groups: [
		{
			name: "Group 0",
			front: [
				{
					image: {
						height: 16,
						width: 32,
						src: "greyscale string"
					},
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
			this.deleteGroup = this.deleteGroup.bind(this);
			this.selectGroup = this.selectGroup.bind(this);
			this.renameGroup = this.renameGroup.bind(this);
			this.selectImage = this.selectImage.bind(this);
			this.uploadImage = this.uploadImage.bind(this);
			this.deleteImage = this.deleteImage.bind(this);
			this.imageChanged = this.imageChanged.bind(this);
			this.testImages = this.testImages.bind(this);
			this.state = Object.assign(STORED_SETTINGS, {
				selected_group: -1,
				selected_image: {display: Object.keys(DISPLAYS)[0], index: -1},
				delete_disabled: false,
				test_state: ""
			});
		}

		// ===== Bound Events =====

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

		deleteGroup(event) {
			const currentGroups = this.state.groups;
			const index = this.state.selected_group;
			if (index >= 0) {
				currentGroups.splice(this.state.selected_group, 1);
			}
			this.setState({
				groups: currentGroups,
				selected_group: -1,
				selected_image: {display: Object.keys(DISPLAYS)[0], index: -1}
			});
		}

		selectGroup(event) {
			const selectedGroup = parseInt(event.target.id.replace(/tab_/g, ""));
			this.setState({
				selected_group: selectedGroup,
				selected_image: {display: Object.keys(DISPLAYS)[0], index: -1}
			}, this.renderSelectedGroup);
			fetch(`/select?group=${selectedGroup}`, {
				method: "POST",
				body: "",
				headers: {
					"Content-type": "application/json; charset=UTF-8"
				}
			}).then(response => response.json()).then(data => {
			});
		}

		renameGroup(event) {
			this.changeValue("name", event.target.value);
		}

		selectImage(display, index, event) {
			this.setState({selected_image: {display: display, index: index}});
		}

		uploadImage(event) {
			const fileList = document.querySelector(`#${event.target.id}`).files;
			const name = event.target.id.replace(/button_upload_/g, "");
			if (fileList.length > 0) {
				const reader = new FileReader();
				reader.onload = (progressEvent) => {
					const displayList = this.getSelectedGroup()[name];
					const image = new Image();
					image.onload = () => {
						const canvasContext = new OffscreenCanvas(image.width, image.height).getContext("2d");
						canvasContext.drawImage(image, 0, 0);
						const oldImageData = canvasContext.getImageData(0, 0, image.width, image.height)["data"];
						let newImageString = "";
						for (let i = 0; i < oldImageData.length; i += 4) {
							newImageString += Math.round((oldImageData[i] + oldImageData[i + 1] + oldImageData[i + 2]) / 3).toString(16).padStart(2, "0");
						}
						displayList.push({
							image: {height: image.height, width: image.width, src: newImageString},
							settings: Object.assign({}, IMAGE_SETTINGS)
						});
						this.changeValue(name, displayList);
					}
					image.src = progressEvent.target.result;
				};
				reader.readAsDataURL(fileList[0]);
			}
			document.querySelector(`#${event.target.id}`).value = "";
		}

		deleteImage(event) {
			const {display, index} = this.state.selected_image;
			const displayList = this.getSelectedGroup()[display];
			if (index >= 0) {
				displayList.splice(index, 1);
			}
			this.changeValue(display, displayList);
			this.setState({selected_image: {display: display, index: -1}});
		}

		imageChanged(event) {
			const {display, index} = this.state.selected_image;
			const selectedImage = this.getSelectedImage();
			const newImageData = getImageData(DISPLAYS[display]["height"], DISPLAYS[display]["width"], selectedImage["settings"], 1, selectedImage["image"]);
			document.querySelector(`#${display}_${index}_canvas`).getContext("2d").putImageData(newImageData, 0, 0);
		}

		// ===== Utilities =====

		renderSelectedGroup() {
			Object.keys(DISPLAYS).map(key => {
				const selectedDisplay = this.getSelectedGroup()[key];
				[...Array(selectedDisplay.length)].map((u, index) => {
					const newImageData = getImageData(DISPLAYS[key]["height"], DISPLAYS[key]["width"], selectedDisplay[index]["settings"], 1, selectedDisplay[index]["image"]);
					document.querySelector(`#${key}_${index}_canvas`).getContext("2d").putImageData(newImageData, 0, 0);
				});
			});
		}

		changeValue(name, value) {
			const currentGroups = this.state.groups;
			currentGroups[this.state.selected_group][name] = value;
			this.setState({groups: currentGroups}, this.renderSelectedGroup);
		}

		testImages(imageData) {
			this.setState({test_state: "Please Wait..."});
			this.sendImagePostRecursive(0, 0, 0, () => {
				this.setState({test_state: "Saving Settings..."});
				postFile("settings.js", "const STORED_SETTINGS={\"groups\":" + JSON.stringify(this.state["groups"]) + "}", () => {
					this.setState({test_state: ""});
				});
			}, this);
		}

		sendImagePostRecursive(group, display, index, callback, context) {
			const groupKeys = Object.keys(this.state.groups);
			if (group >= groupKeys.length) {
				callback();
				return;
			}
			const displayKeys = Object.keys(DISPLAYS);
			if (display >= displayKeys.length) {
				context.sendImagePostRecursive(group + 1, 0, 0, callback, context);
				return;
			}
			const displayName = displayKeys[display];
			const groupDisplays = this.state.groups[groupKeys[group]][displayName];
			const groupDisplayCount = Object.keys(groupDisplays).length;
			if (index >= groupDisplayCount) {
				fetch(`/delete?group=${group}&display=${display}&index=${index}`, {
					method: "POST",
					body: "",
					headers: {
						"Content-type": "application/json; charset=UTF-8"
					}
				}).then(response => response.json()).then(data => {
					context.sendImagePostRecursive(group, display + 1, 0, callback, context);
				});
				return;
			}
			this.setState({test_state: `Uploading Displays... (${Math.round((group + (display + index / groupDisplayCount) / displayKeys.length) * 100 / groupKeys.length)}%)`});
			const {height, width} = DISPLAYS[displayName];
			const displaySettings = groupDisplays[index]["settings"];
			const displayImage = groupDisplays[index]["image"];
			const imageData = this.bitArrayToHexArray(getImageBitArray(height, width, displaySettings, displayImage), height, width);
			const fancyScroll = displaySettings["fancy_scroll"];
			postFile(`${group}-${display}-${index}.txt`, (fancyScroll < 0 ? "01" : "00") + imageData, () => {
				if (fancyScroll < 0) {
					const scale = displaySettings["scale_down"] / displaySettings["scale_up"];
					const xOffsetRaw = (displayImage["width"] - Math.floor(width * scale)) / 2 + displaySettings["x"] + Math.floor((width + fancyScroll * 8) * scale);
					const displayWindowWidthRaw = displayImage["width"] - xOffsetRaw;
					const xOffset = Math.floor((displayWindowWidthRaw - displayImage["width"]) / 2 + xOffsetRaw);
					const displayWindowWidth = Math.floor(displayWindowWidthRaw / scale);
					const imageDataScroll = this.bitArrayToHexArray(getImageBitArray(height, displayWindowWidth, Object.assign({}, displaySettings, {
						x: xOffset,
						fancy_scroll: 0
					}), displayImage, true), height, displayWindowWidth + 8);
					const scrollStartString = (width + fancyScroll * 8).toString(16).padStart(4, "0");
					const scrollWidthString = (displayWindowWidth + 8).toString(16).padStart(4, "0");
					const scrollZoomString = Math.floor(displaySettings["scale_up"]).toString(16).padStart(4, "0");
					postFile(`${group}-${display}-${index}-fs.txt`, scrollStartString + scrollWidthString + scrollZoomString + imageDataScroll, () => {
						context.sendImagePostRecursive(group, display, index + 1, callback, context);
					});
				} else {
					context.sendImagePostRecursive(group, display, index + 1, callback, context);
				}
			});
		}

		bitArrayToHexArray(bitArray, height, width) {
			let hexArray = "";
			for (let row = 0; row < height; row += 8) {
				for (let column = 0; column < width; column++) {
					for (let j = 0; j < 8; j += 4) {
						let sum = 0;
						for (let i = 0; i < 4; i++) {
							sum += (bitArray[column + (i + j) * width + row * width] << i);
						}
						hexArray += sum.toString(16);
					}
				}
			}
			return hexArray;
		}

		// ===== Get Utilities =====

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

		// ===== Render =====

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
						<div hidden={Object.keys(this.state.groups).length === 0} className="tab_link">
							{this.state.test_state === "" ?
								<a onClick={this.testImages}>Save and Upload</a> :
								this.state.test_state
							}
						</div>
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
									<input
										className="input_button delete"
										type="submit"
										value="Delete Group"
										disabled={this.state.delete_disabled}
										onClick={this.deleteGroup}
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
									key={display + index}
									image={getArray("image", selectedImage, {height: 1, width: 1, src: ""})}
									settings={getArray("settings", selectedImage, Object.assign({}, IMAGE_SETTINGS))}
									height={DISPLAYS[display]["height"]}
									width={DISPLAYS[display]["width"]}
									onChange={this.imageChanged}
									onDelete={this.deleteImage}
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
			this.state = {zoom: 3, image: null, delete_disabled: false};
		}

		componentDidMount() {
			this.drawCanvas();
		}

		drawCanvas() {
			const {hidden, height, width, image, settings} = this.props;
			if (!hidden) {
				this.setState({image: image});
				const canvas = document.createElement("canvas");
				canvas.height = image.height;
				canvas.width = image.width;
				canvas.getContext("2d").putImageData(greyscaleCompressedToImageData(image), 0, 0);
				document.querySelector("#image_original").src = canvas.toDataURL();
				const zoomedImageData = getImageData(height, width, settings, this.state.zoom, image);
				const editedContext = document.querySelector("#canvas_edited").getContext("2d");
				editedContext.putImageData(zoomedImageData, 0, 0);
				const fancyScroll = settings["fancy_scroll"];
				if (fancyScroll < 0) {
					editedContext.beginPath();
					const x = (width + fancyScroll * 8) * this.state.zoom;
					editedContext.moveTo(x, 0);
					editedContext.lineTo(x, height * this.state.zoom);
					editedContext.strokeStyle = "red";
					editedContext.stroke();
				}
			}
		}

		updateZoom(zoom) {
			this.setState({zoom: zoom}, this.drawCanvas);
		}

		updateImageSettings(parameter, value) {
			const {settings, onChange} = this.props;
			settings[parameter] = value;
			onChange();
			this.drawCanvas();
		}

		render() {
			const {hidden, height, width, settings, onDelete} = this.props;
			const scale = settings["scale_down"] / settings["scale_up"];
			const horizontalOffsetMax = Math.ceil((getArray("width", this.state.image, 0) + width * scale) / 2);
			const verticalOffsetMax = Math.ceil((getArray("height", this.state.image, 0) + height * scale) / 2);
			const zoom = this.state.zoom;
			return (
				hidden ?
					<div>
						<h1>Manage your destination group.</h1>
						<p>Select an uploaded display to edit, or add a display using the + button for each screen.</p>
						<p>Click on "Save and Upload" on the left to save your changes and see your displays in
							action.</p>
					</div> :
					<div>
						<img id="image_original" height={height * zoom + (zoom === 1 ? 2 : 1)} alt="Source Image"/>
						&nbsp;
						<div className="scroll_box canvas_box">
							<canvas
								className={zoom > 1 ? "extra_borders" : "all_borders"}
								id="canvas_edited"
								height={height * zoom}
								width={width * zoom}
							/>
						</div>
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
								id="slider_fancy_scroll"
								className="bottom_line"
								title="Scroll Point"
								min={-width / 8}
								max={0}
								default={IMAGE_SETTINGS["fancy_scroll"]}
								value={settings["fancy_scroll"]}
								onChange={(value) => this.updateImageSettings("fancy_scroll", value)}
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
						<br/>
						<input
							className="input_button delete"
							type="submit"
							value="Delete Image"
							disabled={this.state.delete_disabled}
							onClick={onDelete}
						/>
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

function greyscaleCompressedToImageData(compressed) {
	const {height, width, src} = compressed;
	const newImageData = new ImageData(width, height);
	for (let i = 0; i < src.length / 2; i++) {
		const charCode = parseInt(src.substring(i * 2, i * 2 + 2), 16);
		newImageData.data[i * 4] = charCode;
		newImageData.data[i * 4 + 1] = charCode;
		newImageData.data[i * 4 + 2] = charCode;
		newImageData.data[i * 4 + 3] = 255;
	}
	return newImageData;
}

function getImageBitArray(height, width, settings, image, padRows = false) {
	const scale = settings["scale_down"] / settings["scale_up"];
	const scaleHeight = Math.floor(height * scale);
	const scaleWidth = Math.floor(width * scale);
	const canvasContext = new OffscreenCanvas(image.width, image.height).getContext("2d");
	canvasContext.putImageData(greyscaleCompressedToImageData(image), 0, 0);
	const oldImageData = canvasContext.getImageData(settings["x"] + (image.width - scaleWidth) / 2, settings["y"] + (image.height - scaleHeight) / 2, scaleWidth, scaleHeight)["data"];
	const newBitArray = [];
	for (let row = 0; row < height; row++) {
		if (padRows) {
			newBitArray.push(0, 0, 0, 0, 0, 0, 0, 0);
		}
		for (let column = 0; column < width; column++) {
			let color;
			if (row < settings["crop_top"] || row >= height - settings["crop_bottom"] || column < settings["crop_left"] || column >= width - settings["crop_right"] || column >= width + 8 * settings["fancy_scroll"]) {
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

function postFile(fileName, fileContent, callback) {
	const form = new FormData();
	form.append("file", new File([fileContent], fileName, {type: "plain/text"}));
	fetch("/upload", {
		method: "POST",
		body: form
	}).then(response => response.json()).then(data => callback()).catch(error => {
		console.error(error);
		callback();
	});
}

function getArray(key, array, defaultValue) {
	if (array && key in array) {
		return array[key];
	} else {
		return defaultValue;
	}
}

setup();