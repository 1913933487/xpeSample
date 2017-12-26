function GridEditFrame(namespace, title, entityUrl) {

	var self = this;

	var createFrame = function(tpl) {
		var render = template.compile(tpl);
		var d = {};
		d.namespace = namespace;
		d.title = title;
		var html = render(d);
		$('#content-container').html(html);
	};

	this.addEvent = function() {

		self.grid.on('btn-delete', function() {
			self.grid.remove();
		});

		self.grid.on('btn-add', function() {
			self.edit.load(-1);
		});

		self.grid.on('click-cell', function(field, value, row, $element) {
			self.edit.load($element.id);
		});

		self.edit.on('load', function() {
			$("#grid").hide();
			$("#edit").show();
		});

		self.edit.on('btn-close', function() {
			$("#edit").hide();
			$("#grid").show();
		});

		self.edit.on('btn-save', function() {
			self.edit.save();
		});

		self.edit.on('save', function(data) {
//			self.grid.add(data)
			$("#edit").hide();
			$("#grid").show();
		});
	};

	var loadEntity = function(callback) {
		X.get(entityUrl,
			callback,
			function() {
				X.warn("加载数据失敗");
			});
	};

	var loadTemplate = function(callback) {
		X.get("./resources/tpl/grid-edit-simple.html",
			callback,
			function() {
				X.warn("加载数据失敗");
			});
	};

	this.ready = function(grid, edit) {

		self.grid.addCreateBtn();
		self.grid.addDeleteBtn();
		self.grid.init();

		self.edit.addSaveBtn();
		self.edit.addCloseBtn();
		self.edit.init();

		self.addEvent();
	};

	this.init = function(callback) {

		loadEntity(function(data) {
			loadTemplate(function(tpl) {
				createFrame(tpl);
				var entity = eval('(' + data + ')');

				self.grid = new TableBuilder("#grid", namespace, entity);
				self.edit = new FormBuilder('#edit', namespace, entity);
				if(callback && typeof callback == 'function') callback(self.grid, self.edit);

				if(self.ready && typeof self.ready == 'function') self.ready(entity);
			})
		});
	};
};