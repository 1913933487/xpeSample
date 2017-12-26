var FormUtils = {

	getJson: function(formId) {
		var data = {};
		
		var form = document.getElementById(formId);
		
		var tagElements = form.getElementsByTagName('input');
		for(var j = 0; j < tagElements.length; j++) {
			var element = tagElements[j];
			switch(element.type.toLowerCase()) {
				case 'submit':
				case 'hidden':
				case 'password':
				case 'text':
					data[element.name] = element.value;
					break;
				case 'checkbox':
				case 'radio':
					if(element.checked) {
						data[element.name] = element.value == "on";
					} else {
						data[element.name] = false;
					}
					break;
			}
		}

		var tagElements = form.getElementsByTagName('select');
		for(var j = 0; j < tagElements.length; j++) {
			var element = tagElements[j];
			var index = element.selectedIndex;
			var text = element.options[index].text;
			var value = element.options[index].value;
			data[element.name] = value;
		}

		var tagElements = form.getElementsByTagName('textarea');
		for(var j = 0; j < tagElements.length; j++) {
			var element = tagElements[j];
			data[element.name] = $.trim(element.value);
		}
		return data;
	},

	getSelected: function(formId, name) {
		var form = document.getElementById(formId);
		var tagElements = form.getElementsByTagName('select');
		for(var j = 0; j < tagElements.length; j++) {
			if(name == element.name) {
				var data = {};
				var element = tagElements[j];
				data.index = element.selectedIndex;
				data.value = element.options[index].value;
				data.text = element.options[index].text;
				return data;
			}
		}
		return null;
	}
};