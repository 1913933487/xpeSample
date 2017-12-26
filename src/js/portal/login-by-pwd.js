X.sub("init", function() {

	var remember = localStorage.getItem('rememberPassword');
	if(remember) {
		$('#remember').attr('checked', 'true');
	} else {
		$('#remember').attr('checked', 'false');
	}

	function isValid(data) {
		if(!data.username) {
			X.warn('用户名不能为空', 5000, '#login-fail-alert');
			return false;
		}
		if(!data.password) {
			X.warn('密码不能为空', 5000, '#login-fail-alert');
			return false;
		}
		return true;
	}

	function onLoginResponse(respText) {
		var resp = JSON.parse(respText);

		if(resp.code == '0') {
			var xsid = X.cookie.get('xsid');
			if (xsid){
				if(remember) {
					X.cookie.add('xsid', xsid, 30);
					localStorage.setItem('rememberPassword', 1);
				} else {
					X.cookie.add('xsid', xsid, 1);
					localStorage.setItem('rememberPassword', 0);
				}
			}
			window.location = "/home";

		} else {
			X('btn-login').disabled = false;
			X.warn('很遗憾，您输入的用户名或密码有误，请重新输入', 5000, '#login-fail-alert');
		}
	}

	function login() {
		var data = FormUtils.getJson('fm-login-by-pwd');
		if(!isValid(data)) {
			return;
		}
		remember = data.remember
		var cred = {};
		cred.username = data.username;
		cred.password = data.password;
		cred.onLoginResponse = onLoginResponse;
		X('btn-login').disabled = true;
		X.pub('login', cred);
	}
	
	X('btn-login').onclick = function() {
		login();
	}

	$(document).keypress(function(event) {
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(keycode == '13') {
			login();
		}
	});

});