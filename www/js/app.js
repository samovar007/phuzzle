/*
 * Проверка браузера
 */
(function(){
	var node = document.createElement('canvas');
	if (!(window.jQuery 
		&& node.getContext 
		&& node.addEventListener 
		&& node.getBoundingClientRect 
		&& Array.prototype.forEach
		)) {
		return alert('К сожалению, ваш браузер не может быть использован для данного приложения');
	}
})();

function makeLinkToPhuzzle(_imgSrc, _complexity, _body) {
	return '<a href="/?complexity=' + _complexity + '&img=' + encodeURIComponent(_imgSrc) + '">'+_body+'</a>';
}			


var App = (function($) {
	return {
		about: function() {
			this.cover.wnd('О проекте'
				, 'Автор: Василий Самойлов. <br>Помощь в дизайне и верстке: Екатерина Киреева.<br><br>По всем вопросам обращайтесь по адресу devphuzzle' + '@' + 'gmail.com');
		}
		, popup: function(_url) {
			window.open(_url, '', 'toolbar=0,status=0,width=626,height=436');
			return false;
		}
		/**
		 * формирует и посылает jsonp запрос
		 */
		, jsonp: function(_src) {
			var s = document.getElementsByTagName('script')[0], n = document.createElement('script');
			n.type = 'text/javascript';
			n.async = true;
			n.src = _src;
			s.parentNode.insertBefore(n, s);
		}	

		, cover: {
			init: function coverInit() {
				$('<div id="cover" style="display: none"><div class="coverDark"></div><div id="coverText"></div>'
					+ '<div id="coverWnd"><div id="coverWndHeader"></div><div id="coverWndInside"></div>'
					+ '<i class="__icon closeWindow"></i></div></div>').appendTo('body');

				$('#coverWnd i').on('click', this.off);
			}
			, text: function coverOn(_text) {
				$('#coverText').html(_text).show();
				$('#coverWnd').hide();
				$('#cover').show();
			}
			, wnd: function coverWnd(_header, _text) {
				$('#coverText').hide();
				$('#coverWndHeader').html(_header);
				$('#coverWndInside').html(_text);
				$('#coverWnd').show();
				$('#cover').show();
			}
			, off: function coverOff() {
				$('#cover').hide();
			}
		}
		, sharing:  {
			url: ''
			, title: ''
			, img: ''
			, txt: ''
			, init: function(_url, _title, _img, _text) {
				this.url = _url;
				this.title = _title;
				this.img = _img;
				this.txt = _text;
			}
			, vk: function() {
				return 'http://vkontakte.ru/share.php'
					+ '?url='          + encodeURIComponent(this.url)
					+ '&title='       + encodeURIComponent(this.title)
					+ '&description=' + encodeURIComponent(this.txt)
					+ '&image='       + encodeURIComponent(this.img)
					+ '&noparse=true';
			}
			, ok: function() {
				return 'http://www.odnoklassniki.ru/dk?st.cmd=addShare'
					+ '&st.comments=' + encodeURIComponent(this.txt)
					+ '&st._surl='    + encodeURIComponent(this.url);
			}
			, fb: function() {
				return 'http://www.facebook.com/sharer.php?s=100'
					+ '&p[title]='     + encodeURIComponent(this.title)
					+ '&p[summary]='   + encodeURIComponent(this.txt)
					+ '&p[url]='       + encodeURIComponent(this.url)
					+ '&p[images][0]=' + encodeURIComponent(this.img);
			}
			, tw: function() {
				return 'http://twitter.com/share';
					+ '?text='      + encodeURIComponent(this.title)
					+ '&url='      + encodeURIComponent(this.url)
					+ '&counturl=' + encodeURIComponent(this.url);
			}
			, mr: function() {
				return 'http://connect.mail.ru/share'
					+ '?url='          + encodeURIComponent(this.url)
					+ '&title='       + encodeURIComponent(this.title)
					+ '&description=' + encodeURIComponent(this.txt)
					+ '&imageurl='    + encodeURIComponent(this.img);
			}
			, gg: function() {
				return 'https://plus.google.com/share'
					+ '?url='          + encodeURIComponent(this.url)
					;	
			}
		}
	};
	
}(jQuery));

$(document).ready(function() {
	App.cover.init();
});


