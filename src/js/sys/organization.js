X.sub("init", function() {

	var e = new GridEditTreeFrame("organization", "组织架构", "./resources/sys/organization.json");
	e.init(function(grid, edit) {
		edit.addCols("id,code,name,parentId");
		edit.saveValue = function(data){
			X.post('api/sys/organ', data, function(respText) {
			var resp = JSON.parse(respText);
			if(resp.code == '0') {
				edit.hi('save');
			} else {
				X.warn("保存失败");
			}
		});
		}
	});
	
	X.sub('btn-import',function(){
		window.location = "/organImport";
	});
});