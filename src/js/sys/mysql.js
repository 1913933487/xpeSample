X.sub("init", function() {
	
	var e = new GridEditFrame("sql","mysql测试","./resources/sys/mysql.json");
	e.init(function(grid, edit) {
		grid.addCheckBoxCol();
		grid.addCols("id,name");
		edit.addCols("id,name");
	});
});