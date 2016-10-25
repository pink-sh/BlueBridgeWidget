/*
Class GeneralExperiment extends BBWidget:
Very general BlueBridge Dataminer client.
It draws all the input fields required to run a certain experiment
and renders all the outputs.

Author: Enrico Anello for FAO
*/
class GeneralExperiment extends BBWidget {
	/* Empty contructor */
	contructor() {};

	/* The init function MUST BE IMPLEMENTED and it gets all the user's configurations */ 
	init (wps_uri, wps_username, wps_token, experiment_id, opencpu_url, div_id, plugin_options) {
		this.wps_uri = wps_uri;
		this.wps_username = wps_username;
		this.wps_token = wps_token;
		this.experiment_id = experiment_id;
		this.container = this.getProperDivIdentificator(div_id);
		this.style = 'vertical';
		this.opencpu_url = opencpu_url;
		this.dateFields = [];
		this.include = this.exclude = [];
		this.expands = true;
		if (plugin_options.dateFields != undefined) {
			this.dateFields = plugin_options.dateFields;
		}
		console.log("BlueBridge GeneralExperiment -> Plugin initialized with parameters:");
		console.log(" - WPS Uri: " + this.wps_uri);
		console.log(" - WPS Username: " + this.wps_username);
		console.log(" - WPS Token: " + this.wps_token);
		console.log(" - Experiment ID: " + this.experiment_id);
		console.log(" - Empty DIV ID: " + this.div_id);
	};

	/* The draw function MUST BE IMPLEMENTED and it handles all the business logic of the plugin */ 
	draw () {
		console.log("BlueBridge GeneralExperiment -> Drawing");

		if (window.experiment == undefined) {
			window.experiment = {};
		}
		window.experiment[this.container] = {};

		var c = $(this.container);
		c.attr("style", "width: 100%;");
		c.empty();
		var containerDiv = $("<div>").attr("class", "bb_exp_container");
		var rightStyle = "bb_right_exp";
		var leftStyle = "bb_left_exp";
		if (this.style.toLowerCase() == 'vertical') {
			rightStyle = "bb_right_exp_vert";
			leftStyle = "bb_left_exp_vert";
		}
		var left = $("<div>").attr("class", leftStyle);
		left.append($("<div>").attr("id", "bb_widg_container_form").attr("class", "bb_widg_container_form"));
		left.append($("<div>").attr("id", "bb_widg_res_out").attr("class", "bb_widg_res_out"));
		this.right = $("<div>").attr("id", "bb_right_exp").attr("class", rightStyle);
		containerDiv.append(left);
		containerDiv.append(this.right);
		c.append(containerDiv);	

		var ocpuOption = {
			wps_uri : this.wps_uri, 
			username : this.wps_username, 
			token : this.wps_token,
			process_id : this.experiment_id,
			fail : this.ocpuCallbackFail
		};

		var _this = this;

		/*
			Success callBack
		*/
		var ocpuCallbackDrawer = function (data) {
			function createChangeCallBack(identifier, that) {
				return function() {
					that.changeInput(this,identifier);
				}
			}
			var divInputStyle = "bb_input_parameters_div";
			if (_this.style.toLowerCase() == 'vertical') {
				divInputStyle = "bb_input_parameters_div_vert";
			}
			var datesFields = {};
			for (var i = 0; i < data.length; i++) {
				var divInput = $("<div>").attr("class", divInputStyle);
				window.experiment[_this.container][data[i].Identifier] = data[i].DefaultValue;
				var identifier = _this.convertFromCamelCase(data[i].Identifier);
				var originalIdentifier = data[i].Identifier;
				var description = data[i].Description;

				var label = $("<div>").attr("class", "bb_wid_attr_label").append($("<label>").html(identifier));

				var paramInput;

				if (_this.dateFields.indexOf(data[i].Identifier) != -1) {
					var ddid = _this.generateUUID();
					var dspan = $("<span>").attr("class", "add-on");
					var di = $("<i>").attr("class", "icon-calendar");
					var dinput = $("<input>").attr("class", "add-on form-control").attr("size", "16").attr("type", "text").attr("value", data[i].DefaultValue).change(createChangeCallBack(originalIdentifier, _this));
					var ddiv = $("<div>").attr("class", "input-append date").attr("id", ddid).attr("data-date", data[i].DefaultValue).attr("data-date-format", "yyyy-mm-dd").attr("data-date-viewmode", "years");

					dspan.append(di);
					ddiv.append(dinput).append(dspan);
					paramInput = ddiv;

					datesFields[ddid] = createChangeCallBack(originalIdentifier, _this);

				} else {
					if (data[i].AllowedValues.length > 1) {
						paramInput = $("<select>").attr('name', data[i].Identifier).attr('id', identifier).attr("class", "form-control").attr("style", "margin-bottom: 10px; margin-left: 5px;").change(createChangeCallBack(originalIdentifier, _this));
						for (var j =0; j < data[i].AllowedValues.length; j++) {
							paramInput.append($("<option>").attr('value', data[i].AllowedValues[j]).text(data[i].AllowedValues[j]));
						}
					} else {
						paramInput = $("<input>").attr('type', 'text').attr('name', identifier).attr('id', identifier).attr("class", "form-control").attr("style", "margin-bottom: 10px; margin-left: 5px;").change(createChangeCallBack(originalIdentifier, _this)).val(data[i].DefaultValue);
					}
				}
				var qMark = $("<div>").attr("class", "tooltip2").html("?&nbsp;&nbsp;&nbsp;&nbsp;").append($("<div>").attr("class", "tooltiptext2").html(description));
				var divInputTop = $("<div>").attr("class", "bb_input_top_side");
				var divInputBottom = $("<div>").attr("class", "bb_input_bottom_side");
				divInputTop.append(label);
				divInputTop.append($("<div>").attr("class", "bb_wid_attr_input").append(paramInput));
				divInputBottom.append($("<div>").attr("class", "bb_input_desc").html(description));

				divInput.append(divInputTop);
				divInput.append(divInputBottom);


				$(_this.container).find("#bb_widg_container_form").append(divInput);
			}

			var showChar = 150;  // How many characters are shown by default
			var ellipsestext = "...";
			var moretext = "Show more >";
			var lesstext = "Show less";
			$('.bb_input_desc').each(function() {
				var content = $(this).html();
				if(content.length > showChar) {
					var c = content.substr(0, showChar);
					var h = content.substr(showChar, content.length - showChar);
					var html = c + '<span class="bb_moreellipses">' + ellipsestext+ '&nbsp;</span><span class="bb_morecontent"><span>' + h + '</span>&nbsp;&nbsp;<a href="" class="bb_morelink">' + moretext + '</a></span>';
					$(this).html(html);
				}

			});
			$(".bb_morelink").click(function(){
				if($(this).hasClass("bb_less")) {
					$(this).removeClass("bb_less");
					$(this).html(moretext);
				} else {
					$(this).addClass("bb_less");
					$(this).html(lesstext);
				}
				$(this).parent().prev().toggle();
				$(this).prev().toggle();
				return false;
			});

			var runExperimentButton = $("<button>").html("Run Experiment").attr("class", "btn btn-primary bb_run_experiment_button");
			runExperimentButton.bind( "click", function() {_this.runExperiment()});
			var buttonDiv = $("<div>").attr("class", divInputStyle).append(runExperimentButton);
			$(_this.container).find("#bb_widg_container_form").append(buttonDiv);
			for (var key in datesFields) {
				var xkey = $("#" + key);
				xkey.datepicker();
			}
		};

		this.ocpuCall(this.opencpu_url, "getProcessInputDescription", ocpuOption, ocpuCallbackDrawer); //OpenCPU call inherited function
	};

	/*
		Runs the experiment
	*/
	runExperiment() {
		var results = $(this.container).find("#bb_widg_res_out");
		$(this.container).find("#bb_right_exp").empty();
		results.empty();
		results.append($("<img>").attr("src", "http://vps282167.ovh.net/BlueBridgeWPSClient/img/wait_progress.gif"));
		var c = $(this.container);
		var values = [];
		var keys = [];
		for (var k in window.experiment[this.container]) {
			if (window.experiment[this.container][k] != undefined) {
				keys.push(k);
				values.push(window.experiment[this.container][k]);
			}
		}
		console.debug("sending for: " + this.container);
		console.debug(keys);
		console.debug(values);

		var _this = this;

		/*
			Success callBack
		*/
		var ocpuExperimentExecutor = function(data) {
			results.empty();
			var out = [];
			for (var i = 0; i < data.length; i++) {
				out.push( $("<div>").attr('class', 'experimentOutHeader').html());
				for (var j = 0; j < data[i].length; j++) {
					if (_this.ValidURL(data[i][j])) {
						if (_this.expands) {
							var zip = new JSZip();
							JSZipUtils.getBinaryContent(data[i][j], function(err, dt) {
								if(err) {
									throw err; // or handle err
								}
								var urlCreator = window.URL || window.webkitURL;
								JSZip.loadAsync(dt).then(function(zip) {
									var fList = [];
									for (var zipEntry in zip.files) {
										fList.push(zip.file(zipEntry));
									}
									var fileList = [];
									var promises = fList.map(function(obj) {
										return new Promise(function(resolve, reject) {
											var zipEntry = obj;
											obj.async(_this.getFileType(zipEntry)).then(function (data) {
												var o = {'data' : data, 'name' : zipEntry.name, 'uuid' : _this.generateUUID()};
												o.mime = _this.getFileType(zipEntry, true);
												if (zipEntry.name.endsWith(".pdf") || zipEntry.name.endsWith(".PDF")) {
													o.containerUuid = _this.generateUUID();
												}
												fileList.push(o);
												resolve();
											});
										});
									});
									Promise.all(promises).then(function() {
										var ul = $("<ul>").attr("class", "nav nav-tabs").attr("id", "bb_results_tab_pane");
										//var tabContents = $("<div>").attr("class", "tab-content").attr("style", "height: 100vh; width: 100%;");
    									var tabContents = $("<div>").attr("class", "tab-content").attr("style", "width: 100%;overflow: scroll;");
										var pdfDivList = [];
										var filteredFileList = _this.filterFileList(fileList);
										for (var i = 0; i < filteredFileList.length; i++) {
											var f = filteredFileList[i];
											var li = $("<li>");
											var a = $("<a>").attr("data-toggle", "tab").attr("role", "tab").attr("href", "#" + f.uuid).html(f.name.split("/")[f.name.split("/").length - 1]);
											ul.append(li.append(a));

											var iDiv = $("<div>").attr("id", f.uuid).attr("class", "tab-pane fade bb-wid-tab-pane-extra");
											if (f.mime == "image/jpg" || f.mime == "image/png") {
												var blob = new Blob( [ f.data ], { type: f.mime } );
												var imageUrl = urlCreator.createObjectURL( blob );
												var image = $("<img>").attr("src", imageUrl);
												iDiv.append(image);
											}
											else if (f.mime == "application/pdf") {
												var pdfDiv = $("<div>").attr("id", f.containerUuid).attr("style", "height: 100vh; width: 100%;");
												iDiv.append(pdfDiv);
											}
											else if (f.mime == "text/html") {
												var blob = new Blob( [ f.data ], { type: f.mime } );
												var htmlUrl = urlCreator.createObjectURL( blob );
												var iFrame = $("<iframe>").attr("src", htmlUrl).attr("style", "height: 100vh; width: 100%;");
												iDiv.append(iFrame);
											}
											else if (f.mime == "text/plain") {
												iDiv.html(f.data);
											}
											else if (f.mime == "text/csv") {
												var csvData = Papa.parse(f.data);
												var table = $("<table>").attr("class", "bb_csv_tbl");
												for (var ii = 0; ii < csvData.data.length; ii++) {
													var tr = $("<tr>");
													for (var jj = 0; jj < csvData.data[ii].length; jj++) {
														var tdClass = "bb_wid_td_row";
														if (ii == 0) {
															tdClass = "bb_wid_td_row_header";
														}
														var td = $("<td>").attr("class", tdClass).html(csvData.data[ii][jj]);
														tr.append(td);
													}
													table.append(tr);
												}
												iDiv.append(table);
											}
											tabContents.append(iDiv);
										}
										$(_this.container).find("#bb_right_exp").append(ul).append(tabContents);


										//Appending PDFs
										setTimeout(function() {
											for (var i = 0; i < fileList.length; i++) {
												var f = fileList[i];
												if (f.mime == "application/pdf") {
													var pdfObject = f;
													var blob = new Blob( [ f.data ], { type: "application/pdf" } );
													var pdfUrl = urlCreator.createObjectURL( blob );
													var a = $("<a>").attr("href", pdfUrl).attr("download", pdfObject.name).attr("style", "margin-left: 20px; line-height: 4;").html("Download PDF File");
													$("#" + pdfObject.containerUuid).append(a);
													if(PDFObject.supportsPDFs){
														PDFObject.embed(pdfUrl, "#" + pdfObject.containerUuid);
													}
												}
											}
										}, 1000);
										setTimeout(function() {
											var firstLi = $("#bb_results_tab_pane li").first();
											var firstTabAnchor = firstLi.find("a").first();
											firstTabAnchor.click();
											//$("#bb_results_tab_pane li").first().addClass("active");
										}, 3000);
										
									});
								});
							});
						}
						var anchor = $('<a>').attr('href', data[i][j]).attr('target', '_blank').html("Download Computed Results");
						out.push($("<div>").append(anchor));
					} 
				}
			}
			for (var i = 0; i < out.length; i++) {
				results.append(out[i]);
			}
		}

		var ocpuOption = {
			wps_uri : this.wps_uri, 
			username : this.wps_username, 
			token : this.wps_token,
			process_id : this.experiment_id,
			keys : keys,
			values : values,
			fail : this.ocpuCallbackFail
		};

		this.ocpuCall(this.opencpu_url, "getOutput", ocpuOption, ocpuExperimentExecutor); //OpenCPU call inherited function

	};

	ocpuCallbackFail() {
		$("#bb_widg_res_out").html('Error retrieving data from OpenCpu');
	};

	changeInput(input, identifier) {
		for (var k in window.experiment[this.container]) {
			if (k==identifier) {
				if (input.value.trim() == "") {
					window.experiment[this.container][identifier] = undefined;	
				} else {
					window.experiment[this.container][identifier] = input.value;
				}
			}
		}
	};

	filterFileList(fileList) {
		for (var i = 0; i < this.include.length; i++) {
			var fToInclude = this.include[i].toLowerCase();
			var idxToRemove = [];
			for (var j = 0; j < fileList.length; j++) {
				var tFile = fileList[j].name.split("/")[fileList[j].name.split("/").length - 1].toLowerCase();
				if (fToInclude.trim() != tFile.trim()) {
					idxToRemove.push(j);
				}
			}
			for (j = idxToRemove.length - 1; j >= 0; j--) {
				fileList.splice(idxToRemove[j], 1);
			}
		}
		if (this.include.length == 0) {
			for (var i = 0; i < this.exclude.length; i++) {
				var fToExclude = this.exclude[i].toLowerCase();
				for (var j = 0; j < fileList.length; j++) {
					var tFile = fileList[j].name.split("/")[fileList[j].name.split("/").length - 1].toLowerCase();
					if (fToExclude.trim() == tFile.trim()) {
						fileList.splice(j, 1);
						break;
					}
				}
			}
		}
		return fileList;
	};
}