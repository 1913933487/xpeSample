(function() {

	var get = function(id) {
		if(id && id >= 0) {
			var resptext = http('/db/organ?id=' + id).get();
			return resptext ? null : JSON.parse(resptext);
		}
		return null;
	};

	var getTree = function(obj) {
		if(obj && obj.id && obj.id > 0) {
			var url = '/db/organ/sel?lev' + obj.lev + '=' + obj.id;
			var resptext = http(url).get();
			var c = JSON.parse(resptext);
			if(c.meta && c.meta.total && c.meta.total != "0") {
				return c.data;
			}
		}
		return null;
	};

	var err = function(resp, code, msg) {
		var r = {
			code: code,
			msg: msg
		};
		resp.body = JSON.stringify(r);
	};

	var find = function(aa, id) {
		for(var i = 0; i < aa.length; i++) {
			if(aa[i].id == id) {
				return aa[i];
			}
		}
		return null;
	};

	var save = function(paths, n) {
		var ps = paths.concat();
		ps.push(n.id);

		var e = {};
		for (i in n){
			if (i != 'child'){
				e[i] = n[i];
			}
		}
		e.path = '/' + paths.join('/') + '/';
		e.lev = paths.length;
		
		for(var i = 1; i <= 9; i++) {
			if(i <= paths.length) {
				e['lev' + i] = paths[i - 1];
			} else {
				e['lev' + i] = '-1';
			}
		}

		http('/db/organ').post(JSON.stringify(e));
		//TODO 没判断执行状况

		if(n.child) {
			n.child.forEach(function(i) {
				save(ps, i);
			});
		}
	};

	var api = function(req, resp) {
		var path = req.path;
		var o = req.body ? JSON.parse(req.body) : null;
		
//		if(!o || !o.id || !o.parentId || !o.name) {
//			err(resp, 1, '参数不正确');
//			return;
//		}

		// 判断上级和本级
		var parent = get(o.parentId)
		var old = get(o.id)

		o.parentId = parent ? parent.id : -1;
		o.leaf = old ? old.leaf : false;

		if(parent) {
			o.parentId = parent.id;
			o.lev = parent.lev + 1;
			o.path = parent.path + o.id + "/"
			for(var i = 1; i <= 10; i++) {
				var col = 'lev' + i;
				if(i <= parent.lev) {
					o[col] = parent[col];
				} else if(i == o.lev) {
					o[col] = o.id
				} else {
					o[col] = -1;
				}
			}
			
		} else {
			o.parentId = -1;
			o.lev = 1;
			o.path = "/" + o.id + "/";
			o.lev1 = o.id;
			for(var i = 2; i <= 10; i++) {
				o['lev' + i] = -1;
			}
		}

		var resptext = http('/db/organ').post(JSON.stringify(o));
		var r = JSON.parse(resptext);
		if(r.code != '0') {
			resp.body = resptext;
			return;
		}

		if(obj == null || old.leaf || old.parentId == o.parentId) {
			resp.body = '{"code":0,"id":' + r.id + '}'
			return;
		}

		//------------------------------------------------
		// 处理下级 path
		//------------------------------------------------
		var list = getTree(obj);
		var root;
		for(var i = 0; i < list.length; i++) {
			var c = aa[i];
			c.leaf = true;

			var p = find(list, c.parentId)
			if(p) {
				if(!p.child) {
					p.child = [];
				}
				p.leaf = false;
				p.child.push(c);

			} else {
				root = c;
			}
		}

		if (root && root.child) {
			var paths = [];
			for(var i = 1; i <= o.lev; i ++){
				paths.push(o['lev' + i]);
			}
			root.child.forEach(function(n){
				save(paths, n);
			});
		}
	}

	return {
		onGet: api,
		onPost: api
	};
}());