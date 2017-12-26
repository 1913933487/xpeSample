X.sub("init", function() {

	$('#table').bootstrapTable({
		idField: "id",
		toggle: "table",
		url: "/user/session/list?all=all",
		method: 'get',
		striped: false,
		showColumns: true,
		sortName: "id",
		pagination: true,
		sidePagination: "client",
		paginationLoop: true,
		pageList: "[5, 10, 20, all]",
		pageSize: "5",
		showPaginationSwitch: true,
		showToggle: true,
		showRefresh: true,
		showSearch: true,
		showFooter: true,
		showHeader: true,
		showPaginationSwitch: true,
		clickToSelect: true,
		columns: [{
				field: 'id',
				title: 'ID',
				sortable: true,
				switchable: false
			},
			{
				field: 'username',
				title: '账号'
			},
			{
				field: 'email',
				title: '邮箱'
			},
			{
				field: 'profile.name',
				title: '姓名'
			},
			{
				field: 'action',
				title: '操作',
				formatter: action
			}
		],
		responseHandler: function(res) {
			return res.data;
		}
	});

	function action(value, row) {

		if(row.username == 'admin') {
			return '';
		} else {
			var username = "'" + row.username + "'"
			return '<a href="#" id="setGroup" onclick="setGroup(' + username + ');" class="btn-link">设置为普通用户</a>';
		}
	};

	X.get("/user/session?xsid=" + X.cookie.get('xsid'), function(respText) {
		var resp = JSON.parse(respText),
			group = resp.group || [],
			isRoot = false;
		for(var i = 0; i < group.length; i++) {
			if(group[i] === 'root') {
				isRoot = true;
				break;
			}
		}
		if(!isRoot) {
			$("#table").hide();
			$("#panel-body").html('<div style="text-align:center;"><h4>无权限</h4></div>');
		}
	});
});

function setGroup(username) {

	X.post('/user/group?username=' + username + '&group=user', {}, function(respText) {
		var resp = JSON.parse(respText);
		if(resp.code == '0') {
			X.okcancel('设置用户角色成功');
		} else {
			X.okcancel('设置用户角色失败');
		}
	})
};