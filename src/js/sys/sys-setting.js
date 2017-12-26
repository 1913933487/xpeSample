X.sub("init", function() {

	var e = new GridEditFrame("setting","系统配置","./resources/sys/setting.json");
	e.init(function(grid, edit) {
		grid.addCheckBoxCol();
		grid.addCols("namemapId,name,version");
		edit.addCols("id,namemapId,name,data,version");
	});
});