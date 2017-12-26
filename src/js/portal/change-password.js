X.sub("init", function() {

	var username;

	if(X.cookie.get('xsid')) {
		X.get("/user/session?xsid=" + X.cookie.get('xsid'), function(respText) {
			var resp = JSON.parse(respText);
			if(resp.username && resp.username.length > 0) {
				username = resp.username;
				X('btn-change-password').disabled = false;
			} else {
				X('btn-change-password').disabled = true;
			}
		});
	}

	function err(msg) {
		X.warn(msg, 5000, '#change-password-fail-alert');
		return false;
	}

	function isValid(data) {
		if(!data.oldPassword) return err('旧密码不能为空');
		if(data.password.length < 6) return err('新密码长度不能少于6位');
		if(data.verlifyPassword != data.password) return err('两次输入的新密码不一致');
		return true;
	}

	function onChange() {
		var data = FormUtils.getJson('fm-change-password');
		if(!isValid(data)) {
			X('btn-change-password').disabled = false;
			return;
		}

		var item = {};
		item.username = username;
		item.oldPassword = data.oldPassword;
		item.password = data.password;
		item.verlifyPassword = data.verlifyPassword;

		X.post("/user/session/changepassword", item, function(respText) {
			var resp = JSON.parse(respText);
			if(resp.code == '0') {
				err("修改成功");
			} else {
				err("旧密码错误，修改失败");
			}
			X('btn-change-password').disabled = false;
		});
	}

	X('btn-change-password').onclick = function() {
		X('btn-change-password').disabled = true;
		onChange();
	};

});