/*
 * Различные утилиты для фазлов
 * @author: Samoylov Vasily
 * devphuzzle@gmail.com
 */
var checkBrowser = (function(){
	var node = document.createElement('canvas');
	return !!(window.jQuery 
		&& node.getContext 
		&& node.addEventListener 
		&& node.getBoundingClientRect 
		&& Array.prototype.forEach
		);
})();

if (!checkBrowser) {
	document.write('<div id="oldBrowser"><h1>Ой!</h1>'
		+ '<p>Чтобы собирать пазлы, тебе надо обновить свой браузер. Попроси родителей помочь тебе.</p>'
		+ '<p>А пока можешь поиграть в <a href="http://www.tvidi.ru/ch/games/list/puzzle.aspx">эти паззлы</a></p>'
		+ '</div>');
} else {	

var App = (function($) {
	return {
		popup: function(_url) {
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
					+ '&st.comments=' + encodeURIComponent(this.title + ' ' + this.txt)
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
				return 'http://twitter.com/share'
					+ '?text='      + encodeURIComponent(this.title + ' ' + this.txt)
					+ '&url='      + encodeURIComponent(this.url)
					;//+ '&counturl=' + encodeURIComponent(this.url);
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
		, newFrame: (window.requestAnimationFrame
			|| window.msRequestAnimationFrame
			|| window.webkitRequestAnimationFrame
			|| window.mozRequestAnimationFrame
			|| window.oRequestAnimationFrame
			|| function(_callback)	{_callback();}).bind(window)
		, resizeCanvas: function (_elem, _x, _y) {
			_elem.width = _x;
			_elem.style.width = _x + 'px';
			_elem.height = _y;
			_elem.style.height = _y + 'px';
			return _elem;
		}
		, createCanvasAr: function(_containerNode, _img, _params, _cb) {
			['borderWidth', 'borderHeight', 'cols', 'rows'].forEach(function(_e){
				if (!_params[_e]) {
					throw new Error('Отсутствует обязательный параметр ' + _e + ' при вызове App.createCanvasAr');
				}
			});
			if (_img.width < 100 || _img.height < 100) {
				return _cb.onError('Картинка должна быть не менее 100px по меньшей стороне');
			}
			var X_CNT = _params.cols, Y_CNT = _params.rows;
			var containerWidth = _containerNode.clientWidth - 2 * _params.borderWidth
				, containerHeight = _containerNode.clientHeight - 2 * _params.borderHeight;
			//Надо вычислить коеффициент, на который будем уменьшать картинку
			var koef = Math.min(containerWidth/_img.width, containerHeight/_img.height);
			//Размеры клетки на канве
			var xImgBorder = Math.floor(_params.borderWidth/koef)
				, yImgBorder = Math.floor(_params.borderHeight/koef)
				, xImgSz = Math.floor((_img.width + 2*xImgBorder)/X_CNT)
				, yImgSz = Math.floor((_img.height + 2*yImgBorder)/Y_CNT)
				;
			var xCellSz = Math.floor(Math.ceil(koef * (_img.width + 2*xImgBorder))/X_CNT);
			var yCellSz = Math.floor(Math.ceil(koef * (_img.height + 2*yImgBorder))/Y_CNT);
				//В процессе получится, что мы немного обрежим исходную картинку, чтоб получилось целое количество клеток
					//кладем в массив канв функцию создания
			var canvasFactory = function(x, y, _canvas) {
				var sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight
					, border = 0
					, X_FIRST = 0x1, X_LAST = 0x2, Y_FIRST=0x4, Y_LAST=0x8;

				if (0 == x) { //x
					sX = 0;
					sWidth = xImgSz - xImgBorder;
					dX = _params.borderWidth;
					dWidth = xCellSz - _params.borderWidth;
					border |= X_FIRST;
				} else {
					sX = x * xImgSz - xImgBorder;
					dX = 0;
					sWidth = xImgSz;
					dWidth = xCellSz;
					if (X_CNT-1 == x) {
						sWidth -= xImgBorder;
						dWidth -= _params.borderWidth;
						border |= X_LAST;
					}
				}	
				if (0 == y) {//y
					sY = 0;
					sHeight = yImgSz - yImgBorder;
					dY = _params.borderHeight;
					dHeight = yCellSz - _params.borderHeight;
					border |= Y_FIRST;
				} else {
					sY = y * yImgSz - yImgBorder;
					sHeight = yImgSz;
					dY = 0;
					dHeight = yCellSz;
					if (Y_CNT-1 == y) {
						sHeight -= yImgBorder;
						dHeight -= _params.borderHeight;
						border |= Y_LAST;
					}
				}	

				var canvas =  _canvas
					, ctx = _canvas.getContext('2d');
				App.resizeCanvas(_canvas, xCellSz, yCellSz);

				//рисуем линии
				if (border) {
					ctx.beginPath();
					ctx.lineWidth = 1;
					ctx.strokeStyle = "white";
					if (border & (X_FIRST|X_LAST)) {
						var x4x = border & X_FIRST ? _params.borderWidth-2 : xCellSz - _params.borderWidth + 2; 
						ctx.moveTo(x4x, (border & Y_FIRST ? _params.borderHeight-2 : 0));
						ctx.lineTo(x4x, (border & Y_LAST ? yCellSz - _params.borderHeight + 2 : yCellSz));
					} 
					if (border & (Y_FIRST|Y_LAST)) {
						var y4y = border & Y_FIRST ? _params.borderHeight-2 : yCellSz - _params.borderHeight + 2; 
						ctx.moveTo((border & X_FIRST ? _params.borderWidth-2 : 0), y4y);
						ctx.lineTo((border & X_LAST ? xCellSz - _params.borderWidth + 2 : xCellSz), y4y);
					}
					ctx.stroke();
				}


				ctx.drawImage(_img
					, sX //смещение в исходном
					, sY 
					, sWidth //высота и ширина вырезаемой части
					, sHeight 
					, dX //смещение в канве
					, dY 
					, dWidth //высота и ширина в канве
					, dHeight 
					);
				return _canvas;		
			}
			//Канва-подсказка
			function redrawHelpCanvas(_canvas) {
				var ctx = _canvas.getContext('2d');
				_canvas.style.position = 'absolute';
				_canvas.style.left = 0;
				_canvas.style.top = 0; 
				_canvas.style.display= 'none';
				App.resizeCanvas(_canvas, xCellSz * X_CNT, yCellSz * Y_CNT);
				ctx.fillStyle = 'black';
				ctx.fillRect(0, 0, xCellSz * X_CNT, yCellSz * Y_CNT);
				ctx.lineWidth = 1;
				ctx.strokeStyle = 'white';
				ctx.strokeRect(_params.borderWidth-2
					, _params.borderHeight-2
					, xCellSz * X_CNT - 2 * (_params.borderWidth - 2)
					, yCellSz * Y_CNT - 2 * (_params.borderHeight-2)
					);
				ctx.drawImage(_img
					, 0, 0 
					, xImgSz * X_CNT - 2 * xImgBorder , yImgSz * Y_CNT - 2 * yImgBorder
					, _params.borderWidth, _params.borderHeight
					, xCellSz * X_CNT - 2 * _params.borderWidth, yCellSz * Y_CNT - 2 * _params.borderHeight
				);
				return _canvas
			}
			return {
				canvasFactory: canvasFactory
				, redrawHelpCanvas: redrawHelpCanvas
				, cellWidth: xCellSz
				, cellHeight: yCellSz
			};
		}
		, wordEnding: function (_digit, _ending) {
			if (0 == _digit) {
				return _ending.many;
			} else if (1 == _digit) {
				return _ending.one;
			} else if (5 > _digit) {
				return _ending.some;
			} else if (20 < _digit) {
				return App.wordEnding(_digit % 10, _ending);
			}
			return _ending.many;
		}
		, getParams: function(_url) {
			var getVars = {};
			_url.substring(_url.indexOf('?') + 1).split('&').forEach(function(_el){
				var tmp = _el.split('=', 2);
				if (2 == tmp.length) {
					getVars[tmp[0]] = decodeURIComponent(tmp[1].replace(/\+/g, '%20'));
				}
			});
			return getVars;
		}	

	};
}(jQuery));

$(document).ready(function() {
	App.cover.init();
	$('.topItem.withSubmenu .submenuHeader').hover(function() {
		$('.topItem.withSubmenu .submenu').hide();
		$('.submenu', $(this).parent()).show();
	});
	$('.topItem.withSubmenu .submenu').mouseleave(function() { 
		$(this).hide();
	});
	
});


}