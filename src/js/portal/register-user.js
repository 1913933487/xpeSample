X.sub("init", function() {

	function err(msg) {
		X.warn(msg, 5000, '#register-fail-alert');
		return false;
	}

	function isValidPhone(m) {
		return m && /^1[3|4|5|8][0-9]\d{4,8}$/.test(m);
	}

	function isValid(data) {

		if(!data.iagree) return err('您要先同意使用条款');
		if(!data.username) return err('用户名不能为空');
		if(!/^[a-zA-Z0-9_\.]+$/.test(data.username)) return err('用户名只能由字母，数字，点号和下划线组成');
		if(!data.password) return err('密码不能为空');
		if(data.password.length < 6) return err('密码长度不能少于6位');
		if(data.password != data.password1) return err('两次输入的密码不一致');
		if(!isValidPhone(data.phone)) return err('必须输入正确的手机号码');
		if(!data.smsCode || !/^\d{6}$/.test(data.smsCode)) return err('必须输入正确的短信验证码');

		return true;
	}

	function onRegister() {
		var data = FormUtils.getJson('fm-register');

		if(!isValid(data)) {
			X('btn-reg').disabled = false;
			return;
		}

		var url = '/api/sms/register';
		url += "?username=" + data.username;
		url += "&password=" + data.password;
		url += "&email=" + data.username + '@rbd.com';
		url += "&phone=" + data.phone;
		url += "&smsCode=" + data.smsCode;

		var p = {};
		p.name = data.username;

		X.post(encodeURI(url), JSON.stringify(p),
			function(resptext) {
				var resp = JSON.parse(resptext);
				if(resp.code == '0') {
					window.location = '/home';
				} else {
					err(resp.msg);
					X('btn-reg').disabled = false;
				}
			},
			function(resptext) {
				err('注册不成功');
				X('btn-reg').disabled = false;
			});
	}

	function onSendSms() {
		var data = FormUtils.getJson('fm-register');
		var phone = data.phone;
		//		var phone = data.phone.replace(/\S/g, "");
		if(!isValidPhone(phone)) return err('必须输入正确的手机号码');

		X.get('api/sms/send/register?phone=' + phone,
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

	X('btn-sms-code').onclick = function() {
		X('btn-sms-code').disabled = true;
		onSendSms();
	};

	X('btn-reg').onclick = function() {
		X('btn-reg').disabled = true;
		onRegister();
	};

	X('hide-terms').onclick = function() {
		$("#terms-of-use").hide();
		$("#user-register").show();
	};

	X('show-terms').onclick = function() {
		$("#user-register").hide();
		$("#terms-of-use").show();
	};

});