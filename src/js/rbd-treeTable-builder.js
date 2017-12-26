function treeTableBuilder(node, namespace, entity) {

	IEvent.call(this);
	var self = this,
		tableId = namespace + "Table";

	var configs = {
		nodeIdAttr: "nodeId",
		parentIdAttr: "parentId",
		stringCollapse: "收起",
		stringExpand: "展开",
		expandable: true,
	};

	var renderNode = function(data) {
		var str = "",
			list = "";

		if(data["Sheet1"]) {
			list = data["Sheet1"];
		} else {
			list = data;
		}

		$.each(list, function(i, item) {
			str += '<tr data-id="' + item.id + '" data-node-id="' + item.id + '" data-parent-id="' + item.parentId + '" data-tt-branch="' + (item.leaf ? "false" : "true") + '">' +
				'<td>' +
				(item.leaf ? '<span class="file"></span>' : '<span class="folder"></span>') +
				item.name + '</td>' +
				'<td>' +  item.name + '</td>' +  
				'<td>' + item.code + '</td>' +
				'<td>' + item.parentId + '</td>' +
				'<td><a href="#" id="addNode" name="addNode" style="display:none" title="增加下级"><i class="ion-plus-round"></i></a> <a href="#" id="editNode" title="编辑"><i class="ion-edit"></i></a> <a href="#" id="del" title="删除"><i class="fa fa-remove"></i></a></td>' +
				'</tr>';
		});
		return str;
	}
	
	var loadHtml = function(data) {
		return renderNode(data);
	};

	var onInitialized = function() {

		X.get(entity.url + "/sel?all=all", function(respText) {
			var resp = JSON.parse(respText);
			if(resp.data) {
				var html = loadHtml(resp.data);
				$('#' + tableId).treetable("loadBranch", null, html);
			} else {
				X.warn("加载数据失敗");
			}
		});
	}

	// TODO
	var onNodeInitialized = function() {

	}

	var remove = function(id) {
		X.del(entity.url + '/del?id=' + id, function(respText) {
			var resp = JSON.parse(respText);
			if(resp.code == '0') {
			} else {
				X.warn("删除失敗");
			}
		});
	}

	var add = function() {
		var data = "";
		X.get(entity.url + '/sel?all=all', function(respText) {
			var resp = JSON.parse(respText);
			data = resp.data;
			if(data.length > 0) {
				$('#btn-add').click(function() {
					$('#btn-add').attr('disabled', 'disabled');
					$('a[name="addNode"]').show();
				});
			} else {
				$('#btn-add').click(function() {
					self.hi('btn-add');
				})
			}
		});
	};

	this.init = function() {

		add();

		configs.onInitialized = onInitialized;

		$('#' + tableId).treetable(configs)
			.on('click', '#editNode', function(e) {
				e.preventDefault();
				var id = $(this).closest("tr").data("id");
				self.hi('btn-edit', id);
			})
			.on('click', '#del', function(e) {
				e.preventDefault();
				var id = $(this).closest("tr").data("id");
				remove(id);
			})
			.on('click', '#addNode', function(e) {
				e.preventDefault();
				var id = $(this).closest("tr").data("id");
				self.hi('btn-treeTable-addNode', id);
			});
	};
};

(function() {
	var Super = function() {};
	Super.prototype = IEvent.prototype;
	treeTableBuilder.prototype = new Super();
})();