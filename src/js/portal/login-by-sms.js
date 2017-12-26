X.sub("init", function() {

	function err(msg) {
		X.warn(msg, 5000, '#login-fail-alert');
		return false;
	}

	function isValidPhone(m) {
		return m && /^1[3|4|5|8][0-9]\d{4,8}$/.test(m);
	}

	function isValid(data) {
		if(!isValidPhone(data.phone)) return err('必须输入正确的手机号码');
		if(!data.smsCode || !/^\d{6}$/.test(data.smsCode)) return err('必须输入正确的短信验证码');
		return true;
	}

	function onSendSms() {
		var data = FormUtils.getJson('fm-login-by-sms');
		var phone = data.phone;
		if(!isValidPhone(phone)) return err('必须输入正确的手机号码');

		X.get('api/sms/send/login?phone=' + phone,
			function(resptext) {
				var resp = JSON.parse(resptext);
				if(resp.code > 0) {
					err(resp.msg);
				} else {
					err('短信已经成功发送');
				}
				X('btn-sms-code').disabled = false;
			},
			function(resptext) {
				X('btn-sms-code').disabled = false;
				err('短信发送失败');
			});
	}

	function onLogin() {
		var data = FormUtils.getJson('fm-login-by-sms');
		if(!isValid(data)) {
			X('btn-login').disabled = false;
			return;
		}

		var url = '/api/sms/login/verify';
		url += "?phone=" + data.phone;
		url += "&smsCode=" + data.smsCode;

		X.get(encodeURI(url),
			function(resptext) {
				var resp = JSON.parse(resptext);
				if(resp.code == '0') {
					loginByToken(resp.token);
				} else {
					err(resp.msg);
					X('btn-login').disabled = false;
				}
			},
			function(resptext) {
				err('很遗憾，您输入的手机或验证码有误，请重新输入');
				X('btn-login').disabled = false;
			});
	}

	function loginByToken(token) {
		
		openPage(decodeURIComponent("/user/login"), 'post', [{
			paramName: 'token',
			paramValue: token
		}, {
			paramName: 'redirectTo',
			paramValue: '/home'
		}, {
			paramName: 'error',
			paramValue: "/"
		}]);
	}

	function openPage(url, method, params) {
		//var dynamicForm = document.getElementById("dynamicForm");
		var dynamicForm = document.createElement("form");
		dynamicForm.setAttribute("method", method);
		dynamicForm.setAttribute("action", url);
		dynamicForm.innerHTML = "";
		document.body.appendChild(dynamicForm);
		for(var i = 0; i < params.length; i++) {
			var input = document.createElement("input");
			input.setAttribute("type", "hidden");
			input.setAttribute("name", params[i].paramName);
			input.setAttribute("value", params[i].paramValue);
			dynamicForm.appendChild(input);
		}
		dynamicForm.submit();
	}

	X('btn-sms-code').onclick = function() {
		X('btn-sms-code').disabled = true;
		onSendSms();
	};

	X('btn-login').onclick = function() {
		X('btn-login').disabled = true;
		onLogin();
	};

});