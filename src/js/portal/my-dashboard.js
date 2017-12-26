X.sub("init", function() {

	X.get("/user/session?xsid=" + X.cookie.get('xsid'), function(respText) {

		var resp = JSON.parse(respText),
			userId = resp.id;

		sessionStorage.removeItem("userId");
		sessionStorage.setItem("userId", userId);
	});

	//显示图库
	var classPK=sessionStorage.getItem("userId");
	X.get("resource/file/search?all=all&classNameId=102&classPK=" + classPK, function(respText) {
		var resp = JSON.parse(respText),
			html = '';
		for(var i = 0; i < resp.data.length; i++) {
			html += '<li class="pad-btm">';
			html += '<img src=/resource/file?id=' + resp.data[i].id + ' alt="' + resp.data[i].filename + '" style="width:75px;">';
			html += '</li>';
		}
		$('#ul-img').html(html);
	});

	X('im-replace').onclick = function() {
		var userId = sessionStorage.getItem("userId"),
			area = "#update-photo",
			url = "/resource/file/upload?classNameId=101&classPK=" + userId,
			upload = X.getUploader(area, 1, "image/*");

		X.get("resource/file/search?all=all&classNameId=101&classPK=" + userId, function(respText) {
			var resp = JSON.parse(respText);
			for(var i = 0; i < resp.data.length - 1; i++) {
				X.del('/resource/file/del?classNameId=101&classPK=' + userId + '&id=' + resp.data[i].id);
			}
		});
		upload.upload(url, function(file, message, error) {
			var resp = JSON.parse(message);
			if(!error) {
				X.post('user/session?phtotid=' + resp.id, function(respText) {
					var resp = JSON.parse(respText);
				});
				upload.close();
			};
		});
	};

	X('im-import').onclick = function() {

		var upload = X.getUploader("#import-photo", 8, "image/*"),
			userId = sessionStorage.getItem("userId"),
			url = "/resource/file/upload?classNameId=102&classPK=" + userId;

		upload.upload(url, function(file, message, error) {
			if(!error) {

				upload.close();
			};
		});
	};

	//密码表单验证
	var faIcon = {
		valid: 'fa fa-check-circle fa-lg text-success',
		invalid: 'fa fa-times-circle fa-lg',
		validating: 'fa fa-refresh'
	}

	$('#upPwdForm').bootstrapValidator({
		message: '输入的密码不正确',
		excluded: [':disabled'],
		feedbackIcons: faIcon,
		fields: {
			oldPassword: {
				container: 'popover',
				validators: {
					notEmpty: {
						message: '密码不能为空'
					}
				}
			},
			password: {
				container: 'popover',
				validators: {
					notEmpty: {
						message: '密码不能为空'
					},
					identical: {
						field: 'verlifyPassword',
						message: '密码不一致'
					}
				}
			},
			verlifyPassword: {
				container: 'popover',
				validators: {
					notEmpty: {
						message: '密码不能为空'
					},
					identical: {
						field: 'password',
						message: '密码不一致'
					}
				}
			}
		}
	});
});
//修改密码
function updatepwd() {

	var item = {},
		username = sessionStorage.getItem("username")

	item.username = username;
	item.oldPassword = upPwdForm.oldPassword.value;
	item.password = upPwdForm.password.value;
	item.verlifyPassword = upPwdForm.verlifyPassword.value;

	X.post("/user/session/changepassword", item, function(respText) {

		var resp = JSON.parse(respText);
		if(resp.code === 0) {
			X.okcancel('密码修改成功');
		}
	});
};