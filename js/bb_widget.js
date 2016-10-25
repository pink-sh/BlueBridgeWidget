/*
Class BBWidget:
container of the visualization plugins.
It initialize the plugin and gives it basic routines.

Author: Enrico Anello for FAO
*/

class BBWidget {
	/*
		The constructur gets all the user prefined options
		@Params
		wps_uri: The WPS URI
		wps_username: The WPS Username
		wps_token: The WPS token. If inside the VRE you can leave it blank; the widget will try to hinerit from session.
		opencpu_url: If the calls are through OpenCPU set the endpoint, otherwise undefined
		plugin: the class of the drawing plugin
		plugin_options: Object with all the options to be used by the plugin. Leave {} if none
	*/
	constructor(wps_uri, wps_username, wps_token, experiment_id, div_id, opencpu_url, plugin, plugin_options) {
		this.wps_uri = wps_uri;
		this.wps_username = wps_username;
		this.wps_token = wps_token;
		this.experiment_id = experiment_id;
		this.div_id = div_id;
		this.opencpu_url = opencpu_url;
		this.plugin = plugin;
		this.plugin_options = plugin_options;
	};


	/*
		The init method inits the plugin
	*/
	init() {
		try {
			this.plugin.init(this.wps_uri, this.wps_username, this.fetchSecurityToken(this.wps_token), this.experiment_id, this.opencpu_url, this.div_id, this.plugin_options);
			this.plugin.draw();
		} catch (err) {
			alert("Error initializing plaugins: " + err.message);
		}
	};

	/*
		Sets the # on the div in the case it is set without it
	*/
	getProperDivIdentificator(div_id) {
		if (div_id.charAt(0) != '#') {
			div_id = '#' + div_id;
		}
		return div_id;
	};

	/*
		Gets all URL get parameters with values
	*/
	getAllUrlParams(url) {
		var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

		var obj = {};
		if (queryString) {
			queryString = queryString.split('#')[0];
			var arr = queryString.split('&');
			for (var i=0; i<arr.length; i++) {
				var a = arr[i].split('=');
				var paramNum = undefined;
				var paramName = a[0].replace(/\[\d*\]/, function(v) {
					paramNum = v.slice(1,-1);
					return '';
				});
				var paramValue = typeof(a[1])==='undefined' ? true : a[1];

				if (obj[paramName]) {
					if (typeof obj[paramName] === 'string') {
						obj[paramName] = [obj[paramName]];
					}
					if (typeof paramNum === 'undefined') {
						obj[paramName].push(paramValue);
					} else {
						obj[paramName][paramNum] = paramValue;
					}
				} else {
					obj[paramName] = paramValue;
				}
			}	
		}
		return obj;
	};

	/*
		Returns the security token from the session in case is present, otherwise returns the token set by the user
	*/
	fetchSecurityToken(public_token) {
		var securityToken = this.getAllUrlParams().securityToken;
		var returnSecurityToken = "";
		if(typeof securityToken != "undefined"){
			console.log("Passing security token from VRE to web-app = "+securityToken);
			returnSecurityToken = securityToken;
		}else{
			console.log("Using public security token");
			returnSecurityToken = public_token;
		}
		return returnSecurityToken;
	};

	/*
		Generates an Universal Unique IDentifier
	*/
	generateUUID(){
		var d = new Date().getTime();
		if(window.performance && typeof window.performance.now === "function"){
			d += performance.now(); //use high-precision timer if available
		}
		var uuid = 'xxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		});
		return 'uuid' + uuid;
	};

	/*
		Converts a string from CamelCase to normal
	*/
	convertFromCamelCase(text) {
		var result = text.replace( /([A-Z])/g, " $1" );
		return result.charAt(0).toUpperCase() + result.slice(1);
	};

	/*
		Returns the type of a given file, if GetMime is set to true it returns the mime type of the given file
	*/
	getFileType(file, getMime) {
		if (getMime == undefined) { getMime = false; }
		var mime = undefined;
		var parseType = "uint8array";
		if (file.name.endsWith(".jpg") || file.name.endsWith(".JPG") || file.name.endsWith(".jpeg") || file.name.endsWith(".JPEG")) {
			mime = "image/jpg";
		} else if (file.name.endsWith(".html") || file.name.endsWith(".HTML") || file.name.endsWith(".htm") || file.name.endsWith(".HTM")) {
			mime = "text/html";
		} else if (file.name.endsWith(".png") || file.name.endsWith(".PNG")) {
			mime = "image/png";
		} else if (file.name.endsWith(".pdf") || file.name.endsWith(".PDF")) {
			mime = "application/pdf";
			//containerUuid = generateUUID();
		} else if (file.name.endsWith(".txt") || file.name.endsWith(".TXT")) {
			mime = "text/plain";
			parseType = "string";
		} else if (file.name.endsWith(".csv") || file.name.endsWith(".CSV")) {
			mime = "text/csv";
			parseType = "string";
		}
		if (getMime) {
			return mime;
		} else {
			return parseType;
		}
	};

	/*
		Checks wether a string is an HTTP URL or not
	*/
	ValidURL(str) {
		if (str.startsWith('http')) {
			var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
			return regexp.test(str);
		}
		return false;
	};

	/*
		Calls openCPU
		@Params
		opencpu_url: The url of Open CPU
		method: The method to call
		options: All the options to send to open CPU to run a certain experiment
		successCallBack: Callback called by the ajax request in case of success
	*/
	ocpuCall(opencpu_url, method, options, successCallBack) {
		ocpu.seturl(opencpu_url);
		ocpu.rpc(method,options,successCallBack);
	};
}