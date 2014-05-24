/*
 * Проверка браузера
 */

var puzzle = (function(){
		var   X_CNT	//количество клеток в ширину
		, Y_CNT		//количество клеток в высоту
		, nodes
		, xCellSz
		, yCellSz
		, container	//контейнер для канв
		, containerBox
		, callbacks	//калбаки на некоторые события
		, timer
		, borderHeight = 5	
		, borderWidth = 5
		, newFrame = (window.requestAnimationFrame
			|| window.msRequestAnimationFrame
			|| window.webkitRequestAnimationFrame
			|| window.mozRequestAnimationFrame
			|| window.oRequestAnimationFrame
			|| function(_callback)	{
				_callback();
			}).bind(window)
		;
	var resizeCanvas = function (_elem, _x, _y) {
		_elem.width = _x;
		_elem.style.width = _x + 'px';
		_elem.height = _y;
		_elem.style.height = _y + 'px';
	};

	var puzzle = {
		 x: 0
		, y: 0	//где произошел захват
		, node: null
		, cellXy: null	//координаты клетки
		, isFree: function() {
			return this.node == null;
		}
		, run: function(_imgSrc, _container, _xy, _callbacks) {
			X_CNT = _xy[0];
			Y_CNT = _xy[1];
			callbacks = _callbacks || {};
			if (!callbacks.onError) {
				callbacks.onError = function onError(_str) {
					throw new Exception(_str);
					alert(_str)
				}
			}
			container = _container;
			containerBox = container.getBoundingClientRect();
			var img = new Image();
			img.addEventListener('load', function () {
				if (img.width < 100 || img.height < 100) {
					return callbacks.onError('Картинка должна быть не менее 100px по меньшей стороне');
				}
				var containerWidth = container.clientWidth - 2 * borderWidth
					, containerHeight = container.clientHeight - 2 * borderHeight;
				//Надо вычислить коеффициент, на который будем уменьшать картинку
				var koef = Math.min(containerWidth/img.width, containerHeight/img.height);
				//Размеры клетки на канве
				var xImgSz = Math.floor(img.width/X_CNT)
					, yImgSz = Math.floor(img.height/Y_CNT)
					, xImgBorder = Math.floor(borderWidth/koef)
					, yImgBorder = Math.floor(borderHeight/koef)
					;
				xCellSz = Math.floor(Math.ceil(koef * img.width)/X_CNT);
				yCellSz = Math.floor(Math.ceil(koef * img.height)/Y_CNT);

				//подготовим массив из номеров клеток 
				var cellsAr = Array(X_CNT * Y_CNT);
				for (var x = 0; x < X_CNT; x ++) {
					for (var y = 0; y < Y_CNT; y ++) {
						cellsAr[x*Y_CNT + y] = [x, y];
					}
				}	
				//перемешаем массив из номеров клеток
				var rndIdx, tmp, maxIdx = cellsAr.length-1;
				for (var i=0; i < cellsAr.length; i++) {
					rndIdx = Math.floor(Math.random() * maxIdx);
					tmp = cellsAr[rndIdx];
					cellsAr[rndIdx] = cellsAr[i];
					cellsAr[i] = tmp;
				}

				//В процессе получится, что мы немного обрежим исходную картинку, чтоб получилось целое количество клеток
				nodes = Array(X_CNT);
				for (var x = 0; x < X_CNT; x ++) {
					nodes[x] = Array(Y_CNT);
					for (var y = 0; y < Y_CNT; y ++) {
						var xy = cellsAr[x*Y_CNT + y];
						var canvas = document.createElement('canvas');
						canvas.className = 'puzzleCell';
						canvas.id = xy[0] + xy[1] * X_CNT;
						canvas.style.left = x * xCellSz + 'px';
						canvas.style.top = y * yCellSz + 'px'; 
						
						var sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight;
							
						if (0 == xy[0]) { //x
							sX = xy[0] * xImgSz;
							sWidth = xImgSz - xImgBorder;
							dX = borderWidth;
							dWidth = xCellSz - borderWidth;
						} else {
							sX = xy[0] * xImgSz - xImgBorder;
							dX = 0;
							sWidth = xImgSz;
							dWidth = xCellSz;
							if (X_CNT-1 == xy[0]) {
								sWidth -= xImgBorder;
								dWidth -= borderWidth;
							}
						}	
						if (0 == xy[1]) {//y
							sY = xy[1] * yImgSz;
							sHeight = yImgSz - yImgBorder;
							dY = borderHeight;
							dHeight = yCellSz - borderHeight;
						} else {
							sY = xy[1] * yImgSz - yImgBorder;
							sHeight = yImgSz;
							dY = 0;
							dHeight = yCellSz;
							if (Y_CNT-1 == xy[1]) {
								sHeight -= yImgBorder;
								dHeight -= borderHeight;
							}
						}	
							
						resizeCanvas(canvas, xCellSz, yCellSz);
						canvas.getContext('2d').drawImage(this
							, sX //смещение в исходном
							, sY 
							, sWidth //высота и ширина вырезаемой части
							, sHeight 
							, dX //смещение в канве
							, dY 
							, dWidth //высота и ширина в канве
							, dHeight 
							);
						container.appendChild(canvas);	
						//ловим событие 
						//canvas.addEventListener('mousedown', hold);		
						//кладем в массив канв, через который можно всегда определить место в контейнере
						nodes[x][y] = canvas;
					}			
				}
				if (!!('ontouchstart' in window)) {	//touch screen
					container.addEventListener('touchstart', touchStart);		
					container.addEventListener('touchmove', touchMove);
					container.addEventListener('touchend', unhold);		
					
				} else {	
					container.addEventListener('mousemove', mousemove);
					container.addEventListener('mouseup', unhold);
					container.addEventListener('mouseleave', unhold);
					container.addEventListener('mousedown', hold);		
				}	
				if (callbacks.successLoad) {
					timer = Date.now();
					callbacks.successLoad({sz: [xCellSz * X_CNT, yCellSz * Y_CNT]});
				}
			});	
			img.src = _imgSrc;

			
		}
		, hold: function(_x, _y, _node) {
			if (!this.isFree()) {
				return;
			}
			this.x = _x;
			this.y = _y; 
			this.node = _node;
			this.node.style.opacity = .7;
			this.node.style.zIndex = 10;
			this.cellXy = {x: parseInt(this.node.style.left) /xCellSz 
				, y: parseInt(this.node.style.top) /yCellSz
			};
		}
		, unhold: function() {
			if (this.isFree()) {
				return;
			}	
			//Определяем, над какой клеткой опустили мышь
			var changedCellX = Math.floor((this.x - containerBox.left)/xCellSz)
				, changedCellY  = Math.floor((this.y - containerBox.top)/yCellSz)
				;
			if (nodes[changedCellX] && nodes[changedCellX][changedCellY]) {
				//существует клетка
				with (nodes[changedCellX][changedCellY].style) {
					left = this.cellXy.x * xCellSz + 'px';
					top = this.cellXy.y * yCellSz + 'px';
				}
				nodes[this.cellXy.x][this.cellXy.y] = nodes[changedCellX][changedCellY];
			} else {
				changedCellX = this.cellXy.x;
				changedCellY = this.cellXy.y;
			}	
				
			this.node.style.opacity = 1;
			this.node.style.zIndex = 0;
			this.node.style.left = changedCellX * xCellSz + 'px';
			this.node.style.top = changedCellY * yCellSz + 'px';
			nodes[changedCellX][changedCellY] = this.node;
			this.node = null;
			//проверка на выигрыш
			var win = true, maxId = -1;
			for (var y = 0; y < Y_CNT; y++) {
				for (var x = 0; x < X_CNT; x ++) {
					var nodeId = parseInt(nodes[x][y].id);
					if (maxId > nodeId) {
						win = false;
						y = Y_CNT;
						x = X_CNT;
					} else {
						maxId = nodeId;
					}
				}
			}
			if (win) {
				if (!!('ontouchstart' in window)) {	//touch screen
					container.removeEventListener('touchstart', touchStart);		
					container.removeEventListener('touchmove', touchMove);
					container.removeEventListener('touchend', unhold);		
					
				} else {	
					container.removeEventListener('mousemove', mousemove);
					container.removeEventListener('mouseup', unhold);
					container.removeEventListener('mouseleave', unhold);
					container.removeEventListener('mousedown', hold);
				}	

				if (callbacks.win) {
					newFrame(function() {callbacks.win(Date.now() - timer)});
				}
			}
		}
		, move: function(_x, _y) {
			if (this.isFree()) {
				return;
			}
			this.node.style.left = parseInt(this.node.style.left) + (_x - this.x) + 'px';
			this.node.style.top = parseInt(this.node.style.top) + (_y - this.y) + 'px';
			this.x = _x;
			this.y = _y;
		}
	};
	function holdCell(_e) {
		if (_e.target.className == 'puzzleCell') {
			puzzle.hold(_e.pageX, _e.pageY, _e.target);
		}	
	}
	//Реакции на события
	function unhold(_e) {
		puzzle.unhold();
		_e.preventDefault();
		return false;
	}
	function hold(_e) {
		holdCell(_e);
		_e.preventDefault();
		return false;
	}	
	function mousemove(_e) {
		newFrame(function(){puzzle.move(_e.pageX, _e.pageY)});
	}
	function touchStart(_e) {
		holdCell(_e.touches[0]);
		_e.preventDefault();
		return false;
	}
	function touchMove(_e) {
		var touch = _e.touches[0];
		newFrame(function(){puzzle.move(touch.pageX, touch.pageY)});
		_e.preventDefault();
		return false;
	}
	
	return puzzle;
}());


/* 
 * Интерфейс
 */
(function($) {
	var  complexityAr = [[3, 3]
			, [5, 5]
			, [12, 12]
		];
	//Если каких-то данных нет...
	function showStep1() {
		App.showYfd = function(_data) {
			var $container = $('#yfdExamplePlace');
			if (!_data.entries ||!_data.entries.length) {
				return;
			}
			var str = '';
			_data.entries.forEach(function(_el){
				str += '<div class="col-xs-4">' + makeLinkToPhuzzle(_el.img.XXXL.href, 1, '<img src="' + _el.img.S.href + '" title="' + _el.title + '">') + '</div>';
			});
			$container.html(str);
		}	
		App.jsonp('http://api-fotki.yandex.ru/api/podhistory/?limit=3&format=json&callback=App.showYfd');
		$('#step1').show();
		$('#step2').hide();
	}
	function showStep2(_imgSrc, _complexityIdx) {
		$('#step2').show();
		$('#step1').hide();

		$('#currentImg').val(_imgSrc);
		var options = '';
		complexityAr.forEach(function(_el, _idx){
			if (_complexityIdx == _idx) {
				options += '<span>' + _el.join('x') + '</span>';
			} else {
				options += makeLinkToPhuzzle(_imgSrc, _idx, _el.join('x'));
			}	
		});
		$('#currentImgComplexity').html(options);
	
		//$item = $('#currentImgComplexity').parent();
		$('.topItem.withSubmenu .submenuHeader').hover(function() {
			$('.topItem.withSubmenu .submenu').hide();
			$('.submenu', $(this).parent()).show();
		});
		$('.topItem.withSubmenu .submenu').mouseleave(function() { 
			$(this).hide();
		});
	}
	
    function wordEnding(_digit, _ending) {
    	if (0 == _digit) {
    		return _ending.many;
    	} else if (1 == _digit) {
    		return _ending.one;
    	} else if (5 > _digit) {
    		return _ending.some;
    	} else if (20 < _digit) {
    		return wordEnding(_digit % 10, _ending);
    	}
    	return _ending.many;
    }

	$(document).ready(function() {
		//Иницилизация
		var url = window.location.search;
		if (!url) {
			return showStep1();
		}
		var getVars = {};
		url.substring(url.indexOf('?') + 1).split('&').forEach(function(_el){
			var tmp = _el.split('=', 2);
			if (2 == tmp.length) {
				getVars[tmp[0]] = decodeURIComponent(tmp[1].replace(/\+/g, '%20'));
			}
		});
		if (!getVars.img) {
			return showStep1();
		}
		getVars.img = getVars.img.replace(/[^-a-zA-Z0-9\._:&=\?\/]+/, '');
		var complexityIdx = parseInt(getVars.complexity);
		if (!complexityAr[complexityIdx]) {
			complexityIdx = 0;
		}
		showStep2(getVars.img, complexityIdx);

		App.cover.text('Загружаю рисунок...');
		puzzle.run(getVars.img
			, document.getElementById('puzzle')
			, complexityAr[complexityIdx]
			, {	
				win: function(_msec) {
					var s = Math.floor(_msec/1000);
					App.sharing.init(location.href
						, 'Фазлы - пазлы из любого изображения'
						, getVars.img
						, 'Я собрал этот пазл за ' + s + ' секунд' + wordEnding(s, {one: 'у', some: 'ы', many: ''})
					);
					var wndBody	= 'Вы справились с заданием за '
						+ s + ' секунд' + wordEnding(s, {one: 'у', some: 'ы', many: ''})
						+ '! Поделитесь своим успехом с друзьями!'
						+ '<div id="sharingContainer">'
						+ '<a target=_blank href="#" class="snicon vk" onclick="return App.popup(App.sharing.vk());"></a>'
						+ '<a target=_blank href="#" class="snicon ok" onclick="return App.popup(App.sharing.ok());"></a>'
						+ '<a target=_blank href="#" class="snicon mr" onclick="return App.popup(App.sharing.mr());"></a>'
						+ '<a target=_blank href="#" class="snicon gg" onclick="return App.popup(App.sharing.gg());"></a>'
						+ '<a target=_blank href="#" class="snicon fb" onclick="return App.popup(App.sharing.fb());"></a>'
						+ '</div>';
					App.cover.wnd('Пазл собран!', wndBody);
				}
				, successLoad: function(_cells) {
					App.cover.off();
				} 
			}
		);
	});
}(jQuery));
