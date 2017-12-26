(function() {
	jQuery.fn.bootstrapTable.defaults.icons = {
		paginationSwitchDown: 'ti-angle-double-down',
		paginationSwitchUp: 'ti-angle-double-up',
		refresh: 'ti-reload',
		toggle: 'ti-layout-grid2',
		columns: 'ti-layout-column4',
		detailOpen: 'ti-angle-down',
		detailClose: 'ti-angle-up'
	}
}());

function TableBuilder(node, namespace, entity) {

	IEvent.call(this);
	
	var self = this;

	var configs = {
		url: entity.url + "/sel?all=all",
		dataField : 'data',
		uniqueId: 'id',
		sortName: "id",
		toggle: "table",
		method: 'get',
		striped: false,
		showColumns: true,
		pagination: true,
		sidePagination: "client",
		showPaginationSwitch: true,
		paginationLoop: true,
		pageList: "[10, 20, 50, all]",
		pageSize: "20",
		showToggle: false,
		showRefresh: true,
		showSearch: true,
		showFooter: true,
		showHeader: true,
		clickToSelect: true,
		toolbar: node + ' #toolbar'
		
	};

	var tableId = namespace + "Table";
	var columns = [];
	var toolbar = [];

	// -----------------------------------------
	// 控制方法
	// -----------------------------------------
	
	this.setOption = function(key, val) {
		configs[key] = val;
	};

	this.addCheckBoxCol = function() {
		columns.push({
			field: '_flag_checkbox',
			checkbox: true
		});
	};

	this.addRadioCol = function() {
		columns.push({
			field: '_flag_radio',
			radio: true
		});
	};

	this.addCol = function(col) {
		columns.push(col);
	};

	this.addAllCol = function() {
		for(i in entity.fields) {
			if(!entity.fields[i].input || entity.fields[i].input != 'textarea') {
				var f = {};
				f.field = i;
				columns.push(f);
			}
		}
	};

	this.addCols = function(cols) {
		if(cols) {
			cols.split(',').forEach(function(col) {
				var c = $.trim(col);
				if (c.length > 0 && entity.fields[c]){
					if(!entity.fields[c].input || entity.fields[c].input != 'textarea') {
						var f = {};
						f.field = c;
						columns.push(f);
					}
				}
			});
		}
	};

	this.setCol = function(col, key, val) {
		columns.forEach(function(c) {
			if(c.field == col) {
				c[key] = val;
			}
		})
	};

	this.addBtn = function(btn) {
		toolbar.push(btn);
	};

	this.addCreateBtn = function() {
		toolbar.push({
			name: 'add',
			title: '新建',
			class: 'btn btn-info',
			iconClass: 'fa fa-plus',
			alone: true,
		});
	};

	this.addDeleteBtn = function() {
		toolbar.push({
			name: 'delete',
			title: '删除',
			class: 'btn btn-danger',
			iconClass: 'fa fa-remove',
		});
	};

	this.responseHandler = function(res){
		return res.data || [];
	}

	// -----------------------------------------
	// Formatter
	// -----------------------------------------

	var getTimestampFormatter = function(f) {

		return function(value, row) {
			var format = f.format || 'yyyy-MM-dd';
			var d = new Date();
			d.setTime(value);
			return DateUtils.dateFormat(d, format);
		};
	};

	var getSelectorFormatter = function(f) {

		return function(value, row) {
			for(var i = 0; i < f.options.length; i++) {
				if(value == f.options[i].code) {
					return f.options[i].name;
				}
			}
			return value;
		};
	};

	// -----------------------------------------
	// 加载 bootstrap table 插件
	// -----------------------------------------

	var $table = $("#" + tableId);

	this.init = function() {
		configs.columns = [];
		if(columns) {
			columns.forEach(function(col) {
				var n = col.field;
				var f = {};
				f.field = n;
				
				if(!col.checkbox && !col.radio) {
					if(entity.fields[n]) {
						f.title = entity.fields[n].title || n;

						if(entity.fields[n].input == 'selector') {
							f.formatter = getSelectorFormatter(entity.fields[n]);

						} else if(entity.fields[n].input == 'date') {
							f.formatter = getTimestampFormatter(entity.fields[n]);
						}
						configs.columns.push(f);
					}
				} else {
					configs.columns.push(f);
				}
			});
		}

		$table.bootstrapTable(configs);

		if(toolbar) {
			toolbar.forEach(function(b) {
				var btn = '<button id="' + b.name + '"';
				if(b.class) {
					btn += ' class="' + b.class + '"';
				}
				if(!b.alone) {
					btn += ' disabled="disabled"';
				}
				btn += '>';
				if(b.iconClass) {
					btn += '<i class="' + b.iconClass + '"></i>';
				}
				btn += ' ' + (b.title || b.name);
				btn += '</button>';

				$(configs.toolbar).append(btn);
				var $btn = $(configs.toolbar + ' #' + b.name);

				if(!b.alone) {
					$btn.click(function() {
						var ids = $.map($table.bootstrapTable('getSelections'), function(row) {
							return row.id
						});
						self.hi('btn-' + b.name, ids);
					});
				} else {
					$btn.click(function() {
						self.hi('btn-' + b.name);
					});
				}

				$table.on('click-cell.bs.table', function(field, value, row, $element) {
					self.hi('click-cell', field, value, row, $element);
				});

				$table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function() {
					self.refreshButton();
				});
			});
		}
	};

	// -----------------------------------------
	// 配置toolbar
	// -----------------------------------------

	this.refreshButton = function() {
		var d = !$table.bootstrapTable('getSelections').length;
		for(i in toolbar) {
			var b = toolbar[i];
			if(!b.alone) {
				var $btn = $(configs.toolbar + ' #' + b.name);
				$btn.prop('disabled', d);
			}
		}
	};

	this.add = function(data) {
		$table.bootstrapTable('removeByUniqueId', data.id);
		$table.bootstrapTable('append', data);
	};

	this.remove = function() {
		var ids = $.map($table.bootstrapTable('getSelections'), function(row) {
			return row.id
		});

		if(entity.sql) {
			X.post(entity.url + '/del?id=' + ids, function(respText) {
				var resp = JSON.parse(respText);
				if(resp.code == '0') {
					$table.bootstrapTable('remove', {
						field: 'id',
						values: ids
					});
					self.refreshButton();
				}
			});

		} else {
			X.del(entity.url + '/del?id=' + ids, function(respText) {
				var resp = JSON.parse(respText);
				if(resp.code == '0') {
					$table.bootstrapTable('remove', {
						field: 'id',
						values: ids
					});
					self.refreshButton();
				}
			});
		}
	};
};

(function() {
	var Super = function() {};
	Super.prototype = IEvent.prototype;
	TableBuilder.prototype = new Super();
})();