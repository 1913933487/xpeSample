/**
 * err(1, '访问路径不正确');
 * err(2, '电话号码不正确');
 * err(11, "操作过于频繁");
 * err(12, "验证码已过期");
 * err(13, "验证码输入错误");
 * err(21, "发送失败");
 */
(function() {
	var getMode = function(path) {

		if(/\/register/.test(path)) {
			return 1;
		}
		if(/\/login/.test(path)) {
			return 2;
		}
		if(/\/changePassword/.test(path)) {
			return 3;
		}
		return -1;
	};

	var findSmsCode = function(mode, phone) {
		return domain.smscode.get(phone + '#' + mode);
	};

	var err = function(resp, code, msg) {
		var r = {
			code: code,
			msg: msg
		};
		resp.body = JSON.stringify(r);
	};

	var send = function(resp, mode, phone) {

		var data = findSmsCode(mode, phone);
		if(data && data.sendTime) {
			var p = new Date().getTime() - data.sendTime;
			if(p < 180000) { //180秒内有效
				err(resp, '11', "操作过于频繁");
				return;
			}
		}
		var template; //登录模版

		if(mode == 1) { //注册
			template = 'SMS_00000000';
		} else if(mode == 3) { //修改密码
			template = 'SMS_1111111';
		} else {
			template = "SMS_222222"; //登录
		}

		//		var code = "";
		//		for(var i = 0; i < 6; i++) {
		//			code += Math.floor(Math.random() * 10);
		//		}
		//		
		//		var url = getUrl(phone, code, template);
		//		var resptext = http(url).get();
		//		var r = !(resptext) ? null : JSON.parse(resptext);

		//---------------------------------
		//TODO 模拟发送OK 
		//---------------------------------
		var code = "888888";
		var r = {};
		r.Code = 'OK';

		if(r && r.Code == 'OK') {
			var item = {};
			item.id = phone + "#" + mode;
			item.phone = phone;
			item.mode = mode;
			item.code = code;
			item.sendTime = new Date().getTime();
			domain.smscode.update(item);
			resp.body = '{"code":0,"msg":"发送成功"}';

		} else {
			resp.body = '{"code":101,"msg":"发送失败"}';
		}
	};

	var findUserByPhone = function(phone) {
		var c = domain.users.search('phone=' + phone);
		if(c.meta && c.meta.total && c.meta.total != "0") {
			return c.data[0];
		}
		return null;
	};

	var verify = function(resp, mode, phone, code) {
		var data = findSmsCode(mode, phone);
		if(!data) {
			err(resp, 13, "验证码输入错误");
			return;
		}
		var p = new Date().getTime() - data.sendTime;
		if(p >= 180000) { //180秒内有效
			err(resp, 12, "验证码已过期");
			return;
		}
		if(data.code != code) {
			err(resp, 13, "验证码输入错误");
			return;
		}

		var user = findUserByPhone(phone);
		if(!user) {
			err(resp, 13, "手机号码不正确");
			return;
		}

		var item = {};
		item.ti = (new Date()).getTime();
		item.id = user.id; //用户id
		item.un = user.username; //用户username
		item.dis = user.name; //用户name
		item.em = user.email; //用户邮箱
		item.iss = "";
		item.mk = 0;
		item.ph = null;
		item.cc = null;
		item.al = null;

		//生成authtoken，设置过期时间为7天
		var token = domain.users.jwt().encrypt(JSON.stringify(item), new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
		resp.body = '{"code":0, "token":"' + token + '"}';
	};

	var onGet = function(req, resp) {

		var body = req.body ? JSON.parse(req.body) : {};
		var path = req.path;
		var params = req.params || {};
		var phone = params.phone
		var mode = getMode(path);
		if(mode <= 0) {
			err(resp, 1, '访问路径不正确');
			return;
		}

		if(!phone || phone.length < 10) {
			err(resp, 2, '电话号码不正确');
			return;
		}

		if(/\/verify/.test(path)) {
			var code = params.smsCode;
			if(code) {
				verify(resp, mode, phone, code);
			} else {
				err(resp, 3, '验证码不正确');
				return;
			}

		} else if(/\/send/.test(path)) {
			send(resp, mode, phone);
			return;

		} else {
			err(resp, 1, '访问路径不正确');
			return;
		}
	};

	var onPost = function(req, resp) {
		var body = req.body ? JSON.parse(req.body) : {};
		var params = req.params || {};
		var path = req.path;

		var phone = params.phone
		if(!phone || phone.length < 10) {
			err(resp, 2, '电话号码不正确');
			return;
		}
		var code = params.smsCode;
		if(!code || code.length < 6) {
			err(resp, 13, '验证码错误');
			return;
		}
		if(/\/verify/.test(path) || /\/send/.test(path)) {
			err(resp, 1, '访问路径不正确');
			return;
		}

		var mode = getMode(path);
		if(mode != 1 && mode != 3) {
			err(resp, 1, '访问路径不正确');
			return;
		}
		var data = findSmsCode(mode, phone);
		if(!data) {
			err(resp, 13, "验证码错误");
			return;
		}
		var p = new Date().getTime() - data.sendTime;
		if(p >= 180000) { //180秒内有效
			err(resp, 12, "验证码已过期");
			return;
		}
		if(data.code != code) {
			err(resp, 13, "验证码输入错误");
			return;
		}
		var c = domain.users.search('username=' + body.username);
		if(c.meta && c.meta.total && c.meta.total > 0) {
			err(resp, 14, "该用户名已经存在");
			return;
		}

		var user = findUserByPhone(phone);
		if(user) {
			err(resp, 14, "该手机已经注册");
			return;
		}

		var idObj = JSON.parse(http('member/id').get());
		var memberId = idObj.id;
		
		var url = '/user';
		url += "?username=" + params.username;
		url += "&password=" + params.password;
		url += "&email=" + params.username + '@rbd.com';
		url += "&phone=" + params.phone;
		url += "&assignGroup=customer";

		var p = {};
		p.name = '##' + params.username;
		p.memberId = memberId;

		var respText = http(encodeURI(url)).post(JSON.stringify(p));
		var r = JSON.parse(respText);
		if(r.code == '0') {
			var item = {};
			item.id = memberId;
			item.username = params.username;
			item.password = params.password;
			item.email = params.username + '@rbd.com';
			item.phone = params.phone;
			item.assignGroup = 0;
			item.name = '##' + params.username;
			respText = domain.users.update(item);
			
			var member = {};
			member.id = memberId;
			member.username = params.username;
			member.phone = params.phone;
			
			http('member').post(JSON.stringify(member));
			
			err(resp, 0, "成功");
		} else {
			err(resp, 99, "注册失败");
		}
	};

	return {
		onGet: onGet,
		onPost: onPost
	};
}());