"use strict";

/**
 * 获取页面的url的参数
 **/

X.getQueryObject = function(url) {
	url = url == null ? window.location.href : url;
	var search = url.substring(url.lastIndexOf("?") + 1);
	var obj = {};
	var reg = /([^?&=]+)=([^?&=]*)/g;
	search.replace(reg, function(rs, $1, $2) {
		var name = decodeURIComponent($1);
		var val = decodeURIComponent($2);
		val = String(val);
		obj[name] = val;
		return rs;
	});
	return obj;
}

X.sub("init", function() {
	X.req = X.getQueryObject(null);
});

/**
 * 提示框
 **/

X.showModal = function(msg) {

	var message = '<div class="media"><div class="media-left text-2x "><i class="';
	message += 'fa fa-warning' + ' icon-circle bg-warning icon-wrap-sm"> </i></div><div class="media-body"><p>';
	message += msg.content + '</p></div></div>';

	bootbox.dialog({
		title: !msg.title ? '提醒' : msg.title,
		message: message,
		buttons: {
			cancel: {
				label: '<i class="fa fa-close"></i> ' + (!msg.cancel ? '取消' : msg.cancel),
				className: "btn-default",
				callback: msg.onCancel
			},
			success: {
				label: '<i class="fa fa fa-check"></i> ' + (!msg.success ? '确认' : msg.success),
				className: "btn-info",
				callback: msg.onSuccess
			}
		}
	});
}

X.okcancel = function(content, onSuccess, onCancel) {

	var o = {
		content: content,
		onSuccess: onSuccess,
		onCancel: onCancel
	};
	X.showModal(o);
}

X.yesno = function(content, onSuccess, onCancel) {

	var o = {
		success: '是',
		cancel: '否',
		content: content,
		onSuccess: onSuccess,
		onCancel: onCancel
	};
	X.showModal(o);
}

X.info = function(message, delay, container) {
	$.niftyNoty({
		type: 'info',
		icon: 'fa fa-info-circle icon-2x',
		message: message,
		container: container || 'floating',
		timer: delay || 5000
	});
};

X.warn = function(message, delay, container) {
	$.niftyNoty({
		type: 'warning',
		icon: 'fa fa-warning icon-2x',
		message: message,
		container: container || 'floating',
		timer: delay || 5000
	});
};

/**
 * 缓存
 **/

X.caches = {
	__data: Object.create(null),

	set: function set(key, val) {
		this.__data[key] = val;
	},

	get: function get(key) {
		return this.__data[key];
	},

	reset: function reset() {
		this.__data = {};
	}
};

/**
 * 模板处理
 **/

X.html = function(id, htmlurl, callBack, onError) {

	var html = X.caches.get(htmlurl);
	if(html) {
		$(id).html(html);
		if(callBack && typeof(callBack) === 'function') {
			callBack();
		}

	} else {

		$.get(htmlurl,
			function(html, status) {
				X.caches.set(htmlurl, html);
				if(status && status == 'success') {
					$(id).html(html);
					if(callBack && typeof(callBack) === 'function') {
						callBack();
					}
				} else {
					if(onError && typeof(onError) === 'function') {
						onError(status);
					}
				}
			}
		);
	}
};

X.loadTmpl = function(id, tplurl, data, callBack, onError) {

	var _render = function(tmpl, data) {
		var tmpl = tmpl ? $.trim(tmpl) : '';
		var html = "";
		if (tmpl && tmpl.length > 0){
			var render = template.compile(tmpl);
			html = render(data);
		}
		$(id).html(html);
		if(callBack && typeof(callBack) === 'function') {
			callBack();
		}
	};

	var tmpl = X.caches.get(tplurl);
	if(tmpl) {
		_render(tmpl, data);

	} else {
		$.get(tplurl,
			function(tmpl, status) {
				if(status && status == 'success') {
					X.caches.set(tplurl, tmpl);
					_render(tmpl, data);
				} else {
					if(onError && typeof(onError) === 'function') {
						onError(status);
					}
				}
			}
		);
	}
};

/**
 * 文件上传
 **/

X.getUploader = function(area, maxFiles, acceptedFiles) {

	Dropzone.autoDiscover = false;
	var html = '<div class="media"><div id="zone" class="media-body dropzone"></div><div class="media-bottom pad-top">';
	html += '<button id="upload" class="btn btn-info text-2x"><i class="fa fa-cloud-upload"></i></button>';
	html += '<button id="remove" class="btn btn-warning text-2x"><i class="fa fa-trash-o"></i></button>';
	html += '<button id="close" class="btn btn-dark text-2x"><i class="fa fa-remove"></i></button>';
	html += '</div></div>';

	$(area).html(html);

	var maxFileNum = maxFiles ? maxFiles : 1;

	var dropz = new Dropzone(area + ' #zone', {
		url: '/unknown',
		paramName: "file",
		method: 'post',
		addRemoveLinks: true,
		filesizeBase: 1000,
		maxFiles: maxFileNum,
		acceptedFiles: acceptedFiles ? acceptedFiles : 'image/*',
		maxFilesize: 10,
		autoProcessQueue: false,
		chunking: true,
		forceChunking: true,
		chunkSize: 2000000,

		dictDefaultMessage: '请拖入文件或者点击选择文件',
		dictInvalidInputType: '文件类型不正确',
		dictFileTooBig: '文件过大',
		dictCancelUpload: '取消',
		dictCancelUploadConfirmation: '是否确认取消?',
		dictRemoveFile: '删除',
		dictMaxFilesExceeded: '超过限制的 ' + maxFileNum + ' 个文件',

		confirm: function(question, accepted, rejected) {
			accepted();
		},

		init: function() {
			this.on("maxfilesexceeded", function(file) {
				//this.removeFile(file); 
			});
			this.on("removedfile", function(file) {});
			this.on("complete", function() {
				$start.prop("disabled", false);
			});
		},

		params: function params(files, xhr, chunk) {
			if(chunk) {
				xhr.current = chunk;
				var url = dropz.options.url;
				url += '&filename=' + encodeURI(chunk.file.name);
				url += '&totalChunks=' + chunk.file.upload.totalChunkCount;
				url += '&current=' + chunk.index;
				url += '&chunkSize=' + chunk.dataBlock.data.size;

				 dropz.options.url = url;
				 
				//				return {
				//					filename: chunk.file.name,
				//					totalChunks: chunk.file.upload.totalChunkCount,
				//					current: chunk.index,
				//					chunkSize: chunk.dataBlock.data.size
				//				};

				return {
					dzuuid: chunk.file.upload.uuid,
					dzchunkindex: chunk.index,
					dztotalfilesize: chunk.file.size,
					dzchunksize: this.options.chunkSize,
					dztotalchunkcount: chunk.file.upload.totalChunkCount,
					dzchunkbyteoffset: chunk.index * this.options.chunkSize
				};
			}
		}
	});

	dropz.submitRequest = function(xhr, formData, files) {

		xhr.send(xhr.current.dataBlock.data);
	};

	var $start = $(area + ' #upload');

	$start.click(function() {
		dropz.processQueue();
	});

	$(area + ' #remove').click(function() {
		X.yesno('是否删除全部图片', function() {
			dropz.removeAllFiles(true);
		});
	});

	$(area + ' #close').click(function() {
		dropz.emit('destroy');
		$(area).html('').hide();
		$('input.dz-hidden-input').remove();
	});

	return {

		upload: function(url, callback) {

			dropz.on("processing", function(file) {
				$start.prop("disabled", true);
				dropz.options.url = url;
			});

			dropz.on("success", function(file, resp, e) {
				if(callback) {
					if(file.xhr && file.xhr.responseText) {
						callback(file, file.xhr.responseText);
					} else {
						callback(file, resp);
					}
				}
			});

			dropz.on("error", function(file, message, xhr) {
				if(callback) {
					if(file.xhr && file.xhr.responseText) {
						callback(file, file.xhr.responseText, 'error');
					} else {
						callback(file, message, 'error');
					}
				}
			});

			$(area).show();
		},

		close: function() {
			dropz.emit('destroy');
			$(area).html('').hide();
			$('input.dz-hidden-input').remove();
		},

		hide: function() {
			$(area).hide();
		},

		show: function() {
			$(area).show();
		}
	};
}

/**
 * 快速录入窗口
 **/
X.prompt = function(title, callback) {
	bootboX.prompt(title, function(result) {
		callback(result);
	});
};

function de(v, d) {
	if(v == undefined || v == null) return d;
	return v;
}

function IEvent() {

	var events = {};

	this.on = function(e, callback) {
		events[e] = callback;
	};

	this.hi = function(e, a1, a2, a3, a4) {
		var f = events[e];
		if(f && typeof f == 'function') {
			f(a1, a2, a3, a4);
		}
	};
}