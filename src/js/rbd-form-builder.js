function FormBuilder(node, namespace, entity) {

	IEvent.call(this);

	var self = this;

	var formId = namespace + "Form";
	var columns = [];
	var toolbar = [];

	this.addCol = function(cols) {
		if(cols) {
			cols.split(',').forEach(function(col) {
				var c = $.trim(col);
				if(c.length > 0 && entity.fields[c]) {
					columns.push(c);
				}
			});
		}
	};

	this.addCols = this.addCol;

	this.addAllCol = function() {
		for(var i in entity.fields) {
			columns.push(i);
		}
	};

	this.addBtn = function(btn) {
		toolbar.push(btn);
	};

	this.addCloseBtn = function() {
		toolbar.push({
			name: 'close',
			title: '关闭',
			class: 'btn btn-cancel',
			iconClass: 'fa fa-close'
		});
	};

	this.addSaveBtn = function() {
		toolbar.push({
			name: 'save',
			title: '保存',
			class: 'btn btn-success',
			iconClass: 'fa fa-save'
		});
	};

	// -----------------------------------------
	// 创建 form render 方法
	// -----------------------------------------
	var render = function(n, f) {
		if(f.input == 'checkbox') {
			return renderCheckbox(n, f);

		} else {
			return '<label class="col-sm-2 control-label" for="' + n + '">' + f.title + '</label>' +
				'<div class="col-sm-4">' +
				renderInput(n, f) +
				'</div>';
		}
	};

	var renderCheckbox = function(n, f) {

		return '<div class="checkbox pad-btm text-left">' +
			'<input id="form-checkbox" class="magic-checkbox" type="checkbox" />' +
			'<label for="form-checkbox">' + f.title + '</label></div>';
	};

	var renderInput = function(n, f) {
		if(f.input == 'textarea') {
			return renderTextarea(n, f);

		} else if(f.input == 'selector') {
			return renderSelector(n, f);

		} else if(f.input == 'date') {
			return renderDate(n, f);

		} else if(f.input == 'address') {
			return renderAddress(n, f);

		} else {
			return renderNormal(n, f);
		}
	};

	var renderNormal = function(n, f) {
		return '<input type="text"' +
			' placeholder="' + f.title + '"' +
			(f.disabled ? 'disabled=""' : '') +
			' id="' + n +
			'" name="' + n +
			'" class="form-control"' +
			' />';
	};

	var renderSelector = function(n, f) {

		var html = '<select ' +
			(f.disabled ? 'disabled=""' : '') +
			' id="' + n +
			'" name="' + n +
			'" class="form-control selectpicker">';

		for(var i = 0; i < f.options.length; i++) {
			html += '<option value="' + f.options[i].name + '">' + f.options[i].name + '</option>';
		}
		html += '</select>';

		return html;
	};

	var renderAddress = function(n, f) {

		return '<select class="form-control address-select" id="' + n + '"></select>';
	};

	var renderDate = function(n, f) {

		return '<div class="input-group date" id="' + n + '-datetimepicker">' +
			'<input type="text" class="form-control"' +
			' id="' + n +
			'" name="' + n + '" />' +
			'<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span></div>';
	};

	var renderTextarea = function(n, f) {
		return '<textarea type="text"' +
			'rows="' + (f.rows ? f.rows : 10) + '"' +
			' placeholder="' + f.title +
			(f.disable ? 'disable="' : '') +
			'" id="' + n +
			'" name="' + n +
			'" class="form-control"' +
			' />';
	};

	this.init = function() {

		// -----------------------------------------
		// 创建 toolbar
		// -----------------------------------------
		if(toolbar && toolbar.length > 0) {
			toolbar.forEach(function(b) {
				var btn = '<button id="' + b.name + '"';
				if(b.class) {
					btn += ' class="' + b.class + '"';
				}
				if(b.disabled) {
					btn += ' disabled="disabled"';
				}
				btn += '>';
				if(b.iconClass) {
					btn += '<i class="' + b.iconClass + '"></i>';
				}
				btn += ' ' + de(b.title, b.name);
				btn += '</button>';

				$(node + ' #toolbar').append(btn);
				var $btn = $(node + ' #toolbar #' + b.name);
				$btn.click(function() {
					self.hi('btn-' + b.name);
				});
			});
		}

		// -----------------------------------------
		// 创建 form
		// -----------------------------------------
		if(columns && columns.length > 0) {
			var html = '';

			columns.forEach(function(n) {
				f = entity.fields[n];
				if(f) {
					html += '<div class="form-group">' + render(n, f) + '</div>\n';
				}
			});

			$('#' + formId).html(html);

			var addrs = {};
			var addrCount = 0;

			columns.forEach(function(n) {
				f = entity.fields[n];
				if(f) {
					if(f.input == 'date') { // 设置datax选择插件
						$('#' + n + '-datetimepicker').datetimepicker({
							format: f.format || 'YYYY-MM-DD',
							locale: moment.locale('zh-cn')
						});
					}
					if(f.input == 'address') {
						if(n == 'provinceId') {
							addrs.province = '---- 所在省 ----';
							addrCount++;
						} else if(n == 'cityId') {
							addrs.city = '---- 所在市 ----';
							addrCount++;
						} else if(n == 'districtId') {
							addrs.district = '---- 所在区 ----';
							addrCount++;
						}
					}
				}
			});

			if(addrCount == 3) {
				$('#' + formId).distpicker({
					province: '---- 所在省 ----',
					city: '---- 所在市 ----',
					district: '---- 所在区 ----'
				});
			}
		}

		// -----------------------------------------
		// 加载Validator
		// -----------------------------------------

		if(columns && columns.length > 0) {
			var bv = {};
			columns.forEach(function(n) {
				if(entity.fields[n]) {
					if(entity.fields[n].validators) {
						var f = {};
						f.container = 'popover',
							f.validators = entity.fields[n].validators;
						bv[n] = f;
					}
				}
			})

			$('#' + formId).bootstrapValidator({
				message: '输入的信息不正确',
				excluded: [':disabled'],
				feedbackIcons: {
					valid: 'fa fa-check-circle fa-lg text-success',
					invalid: 'fa fa-times-circle fa-lg',
					validating: 'fa fa-refresh'
				},
				fields: bv
			});
		}
	}

	var setFormValue = function(data) {
		var $form = document.getElementById(formId);
		columns.forEach(function(n) {
			var f = entity.fields[n];
			if(f) {
				var b = data != undefined && data != null && data[n] != undefined && data[n] != null;
				if(f.input == 'date') {
					$($form[n]).val(DateUtils.timeSatmpToString(b ? data[n] : ''));
				} else if(f.input == 'address' && n != n + 'name') {
					$('#' + n + " option:selected").attr("data-code", (b ? data[n] : ''));
				} else {
					$($form[n]).val(b ? data[n] : '');
				}
			}
		});
	};

	this.setFormValue = setFormValue;

	var getFormValue = function() {
		var $form = document.getElementById(formId);
		var data = {};
		columns.forEach(function(n) {
			var f = entity.fields[n];
			if(f) {
				var v = $.trim($($form[n]).val());
				if(f.input == 'date') {
					data[n] = DateUtils.dataTimeTotamp($($form[n]).val());
				}
				if(n !='id' && f.input != 'date' && f.input != 'address') {
					data[n] = $($form[n]).val();
				}
				if(f.input == 'address') {
					data[n] = $('#' + n + " option:selected").attr("data-code");
				}
			}
		});

		return data;
	}

	this.getFormValue = getFormValue;

	var loadValue = function(id, sucess) {
		X.get(entity.url + '?id=' + id, function(respText) {
			var resp = JSON.parse(respText);
			if(resp.id == id) {
				sucess(resp);
			} else {
				X.warn("【" + id + "】不存在");
			}
		});
	};

	this.load = function(id) {
		if(id < 0) {
			setFormValue(null);
			self.hi('load');
		} else {
			loadValue(id, function(data) {
				setFormValue(data);
				self.hi('load');
			});
		};
	};

	this.saveValue = function(data) {

		X.post(entity.url, data, function(respText) {
			var resp = JSON.parse(respText);
			if(resp.code == '0') {
				self.hi('save');
			} else {
				X.warn("保存失败");
			}
		});
	};

	this.save = function() {
		var data = getFormValue();
		self.saveValue(data);
	}
}

(function() {
	var Super = function() {};
	Super.prototype = IEvent.prototype;
	FormBuilder.prototype = new Super();
})();