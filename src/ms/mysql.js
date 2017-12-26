(function() {
	//换上xxxxx yyy  zzz
	var ds = new DataSource("jdbc:mysql://xxxxx" + "user=yyy&password=zzz&useUnicode=true&characterEncoding=UTF8");

	var onPost = function(req, resp) {
		var body = req.body ? JSON.parse(req.body): {};
		var params = req.params || {};
		var path = req.path;

		print(req.params);
		print("userId=" + req.userId + " and username=" + req.username);
		print("PATH=" + req.path);
		print("BODY=" + JSON.stringify(body));
		print("PARAMS ID=" + params.id);

		var conn = ds.getConnection();
		try {

			if(path == "/api/sql") { //增加， 修改
				if(!body.name) {
					resp.body = '{"code":2,"msg":"参数错误"}';

				} else if(body.id > 0) {
					var stmnt = conn.createStatement();
					var count = stmnt.executeUpdate("UPDATE _test SET name='" + body.name + "' WHERE id=" + body.id);
					if(count > 0) {
						resp.body = '{"code":0,"msg":"更新成功"}';
					} else {
						resp.body = '{"code":2,"msg":"更新失败"}';
					}

				} else {
					var stmnt = conn.createStatement();
					var count = stmnt.executeUpdate("INSERT INTO _test (NAME) VALUE ('" + body.name + "')");
					if(count > 0) {
						resp.body = '{"code":0,"msg":"插入成功"}';
					} else {
						resp.body = '{"code":2,"msg":"插入失败"}';
					}
				}

			} else if(path == "/api/sql/del") { //删除
				
				var id = params.id || body.id;
				if(id > 0) {
					var stmnt = conn.createStatement();
					var count = stmnt.executeUpdate("DELETE FROM _test WHERE id=" + id);
					if(count > 0) {
						resp.body = '{"code":0,"msg":"删除成功"}';
					} else {
						resp.body = '{"code":3,"msg":"删除失败"}';
					}
				} else {
					resp.body = '{"code":2,"msg":"参数错误"}';
				}

			} else {
				resp.body = '{"code":1,"msg":"非法路径"}';
			}

		} finally {
			conn.close();
		}
	};

	var onGet = function(req, resp) {

		var body = req.body ? JSON.parse(req.body): {};
		var params = req.params || {};
		var path = req.path;

		print(req.params);
		print("userId=" + req.userId + " and username=" + req.username);
		print("PATH=" + req.path);
		print("BODY=" + JSON.stringify(body));
		print("PARAMS ID=" + params.id);

		var conn = ds.getConnection();

		try {

			if(path == '/api/sql') { //获得单个
				var id = params.id || body.id;
				if(id > 0) {
					var sql = "SELECT * FROM _test where id=" + id;
					var stmnt = conn.createStatement();
					var rs = stmnt.executeQuery(sql);
					var en = {};
					if(rs.next()) {
						en.id = rs.getLong("id");
						en.name = rs.getString("name");
					}
					resp.body = JSON.stringify(en);

				} else {
					resp.body = '{"code":2,"msg":"参数错误"}';
				}

			} else if(path == '/api/sql/sel') { //查询多个

				var sql = "SELECT * FROM _test";
				var stmnt = conn.createStatement();
				var rs = stmnt.executeQuery(sql);
				var res = [];
				while(rs.next()) {
					var en = {};
					en.id = rs.getLong("id");
					en.name = rs.getString("name");
					res.push(en);
				}
				resp.body = JSON.stringify(res);

			} else {
				resp.body = '{"code":1,"msg":"非法路径"}';
			}

		} finally {
			conn.close();
		}
	};

	return {
		onGet: onGet,
		onPost: onPost
	};

}());