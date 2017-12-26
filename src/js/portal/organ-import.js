X.sub("init", function() {

	$("#xlf").fileinput({
		browseClass: "btn btn-primary btn-block",
		showCaption: false,
		showRemove: false,
		showRemove: false,
		showUpload: false,
		allowedFileExtensions: ["xls"]
	});

	function addLis() {
		var xlf = document.getElementById('xlf');
		if(xlf.addEventListener) xlf.addEventListener('change', handleFile, false);
	}

	addLis();

	function handleFile(e) {
		var files = e.target.files,
		f = files[0];
		readFile(f);
	}

	function to_json(workbook) {
		var result = {};
		workbook.SheetNames.forEach(function(sheetName) {
			var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
			if(roa.length) result[sheetName] = roa;
		});
		return JSON.stringify(result, 2, 2);
	}

	function readFile(file) {

		var name = file.name,
		reader = new FileReader();
		reader.onload = function(e) {
			var data = e.target.result,
			wb = XLSX.read(data, {
				type: "binary"
			});
			var wbdata = JSON.parse(to_json(wb));
			for(var i = 0; i < wbdata['Sheet1'].length; i++) {
				//TODO 服务稍定
				//				X.post('/db/organ', jsonWeb['Sheet1'][i], function(respText) {
				//					var resp = JSON.parse(respText);
				//					if(resp == '0') {
				//
				//					}
				//				});
			}
		};
		reader.readAsBinaryString(file);
	}
});