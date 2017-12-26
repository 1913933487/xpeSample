(function() {

	var regions = {
		86: {
			110000: "北京市",
		},
		110000: {
			110100: "北京市市辖区"
		},
		110100: {
			110101: "东城区",
			110102: "西城区",
			110105: "朝阳区",
			110106: "丰台区",
			110107: "石景山区",
			110108: "海淀区",
			110109: "门头沟区",
			110111: "房山区",
			110112: "通州区",
			110113: "顺义区",
			110114: "昌平区",
			110115: "大兴区",
			110116: "怀柔区",
			110117: "平谷区",
			110118: "密云区",
			110119: "延庆区"
		}
	};

	var aa = [{
		parentId: '0',
		id: '86',
		name: '中国'
	}];

	var toArray = function(p, k, v) {
		if(typeof v == 'object') {
			for(i in v) {
				x(k, i, v[i])
			}
		} else {
			var a = {};
			a.parentId = p;
			a.id = k;
			a.name = v;

			aa.push(a);
		}
	};

	var findParent = function(parentId) {
		for(var i = 0; i < aa.length; i++) {
			if(aa[i].id == parentId) {
				return aa[i];
			}
		}
		return null;
	};

	var save = function(paths, n) {
		var ps = paths.concat();
		ps.push(n.id);

		var e = {};
		e.id = n.id;
		e.parentId = n.parentId;
		e.name = n.name;
		e.leaf = n.leaf;
		e.path = '/' + paths.join('/') + '/';
		e.lev = paths.length;

		for(var i = 1; i <= 6; i++) {
			if(i <= paths.length) {
				e['lev' + i] = paths[i - 1];
			} else {
				e['lev' + i] = '';
			}
		}

		http("/db/sys/region").post(JSON.stringify(e));

		if(n.child) {
			n.child.forEach(function(i) {
				save(ps, i);
			});
		}
	};

	var api = function(req, resp) {

		toArray('', '', regions);

		var root;

		for(var i = 0; i < aa.length; i++) {
			var c = aa[i];
			c.leaf = true;

			var p = findParent(c.parentId)
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
		if(root) {
			save([], root);
		}
	};

	return {
		onGet: api,
		onPost: api
	};

}());