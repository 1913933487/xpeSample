X.sub("init", function() {
	X.ctx = {};
	X.ctx.user = null;
	X.ctx.member = null;
	X.ctx.getMemberId = function() {
		if(X.ctx.user && X.ctx.user.profile && X.ctx.user.profile.memberId) {
			return X.ctx.user.profile.memberId
		} else {
			return X.ctx.user.id;
		}
	};
	X.ctx.getPhotoId = function() {
		return X.ctx && 　X.ctx.member ? X.ctx.member.photoId : null;
	}

	var resetUserInfo = function() {
		var photoId = X.ctx.getPhotoId();
		if(photoId) {
			$('#ctx-photo-top').html('<img class="img-circle img-user media-object" src="/resource/file?id=' + photoId + '"/>');
			$('#ctx-photo').html('<img class="widget-img img-circle img-border-light" src="/resource/file?id=' + photoId + '"/>');
		} else {
			$('#ctx-photo').html('<i class="widget-img img-circle img-border-light text-center ti-user text-2x bg-info"></i>')
		}
		$('#ctx-name').text(X.ctx.member.name || '您的姓名');
		$('#ctx-slogan').text(X.ctx.member.slogan || '个性签名');
		$('#ctx-station').text(X.ctx.member.station || '您的职位');
	}

	var setUserInfo = function() {
		var photoId = X.ctx.getPhotoId();
		if(photoId) {
			$('#ctx-photo-top').html('<img class="img-circle img-user media-object" src="/resource/file?id=' + photoId + '"/>');
		} else {
			$('#ctx-photo').html('<i class="ti-user text-2x"></i>')
		}
		$("#container").addClass("login");
	};

	var loadMenu = function() {
		X.loadTmpl(".navbar-header", '/resources/portal/home-navbar-header.txt', X.ctx, function() {
			X.loadTmpl("#dropdown-user-menu", '/resources/portal/home-dropdown-user-menu.txt', X.ctx, function() {
				X.loadTmpl("#mainnav-menu", '/resources/portal/home-mainnav-menu.txt', X.ctx, function() {
					X.loadTmpl("#aside", '/resources/portal/home-aside.txt', X.ctx, function() {
						setUserInfo();
					});
				});
			});
		});
	};

	if(X.cookie.get('xsid')) {
		X.get("/user/session?xsid=" + X.cookie.get('xsid'), function(respText) {
			var user = JSON.parse(respText);
			if(user.username && user.username.length > 0) {
				X.ctx.user = user;
				var memberId = user.profile.memberId || user.id;
				X.get('/member?id=' + memberId, function(respText) {
					X.ctx.member = JSON.parse(respText);
					X.pub('home-init');
					loadMenu();
				});

			} else if(window.location.pathname == '/home') {
				$('#login-register').show();
			}
		});
	} else {
		$('#login-register').show();
	}

	X.sub('userInfoChanged', function() {
		resetUserInfo();
	});

	X.sub('doLogout', function() {
		X.post("/signoff");
		window.location = "/home";
	});
});