X.sub("home-init", function() {
	var memberId = X.ctx.getMemberId(),
		username = X.ctx.user.username;

	var form = document.getElementById('fm-profile');
	form.name.value = X.ctx.member.name || '您的姓名';
	form.slogan.value = X.ctx.member.slogan || '个性签名';
	form.station.value = X.ctx.member.station || '您的职位';

	function refresh() {
		photoId = X.ctx.getPhotoId();
		if(photoId) {
			$('#my-photo').html('<img id="im-replace" class="widget-img img-circle img-border-light" src="/resource/file?id=' + photoId + '"/>');
		} else {
			$('#my-photo').html('<i id="im-replace" class="widget-img img-circle img-border-light text-center ti-user text-4x bg-info"></i>')
		}
		$('#my-name').text(X.ctx.member.name || '您的姓名');
		$('#my-slogan').text(X.ctx.member.slogan || '个性签名');
		$('#my-station').text(X.ctx.member.station || '您的职位');
	}
	refresh();

	X('my-photo').onclick = function() {
		var area = "#update-photo",
			url = "/resource/file/upload?classNameId=101&classPK=" + memberId,
			upload = X.getUploader(area, 1, "image/*");

		upload.upload(url, function(file, message, error) {
			var resp = JSON.parse(message);
			if(!error) {
				var e = {};
				e.id = memberId;
				e.photoId = resp.id;
				X.ctx.member.photoId = resp.id;
				X.post('member', e, function(respText) {
					var resp = JSON.parse(respText);
					if(resp.code == '0') {
						refresh();
						X.pub('userInfoChanged');
					}
				});
				upload.close();
			};
		});
	};

	X('btn-slogan').onclick = function() {
		var data = FormUtils.getJson('fm-profile');
		var e = {};
		e.id = memberId;
		e.slogan = data.slogan;
		e.station = data.station;
		e.name = data.name;
		X.post('member', e, function(respText) {
			var resp = JSON.parse(respText);
			if(resp.id == memberId && resp.code == '0') {
				X.ctx.member.slogan = e.slogan;
				X.ctx.member.station = e.station;
				X.ctx.member.name = e.name;
				refresh();
				X.pub('userInfoChanged');
				X.info("个人信息已更新");
			}
		});
	};
});