X.sub("init", function() {

	var e = new GridEditFrame("company", "公司管理", "./resources/sys/company.json");
	e.init(function(grid, edit) {
		grid.addCheckBoxCol();
		grid.addCols("code,name,provinceId,cityId,districtId,contactname,contactphone,registedate,status");
		edit.addCols("id,code,name,provinceId,cityId,districtId,address,postcode,status,contactname,contactphone,registedate,startdate,enddate");
	});
});
