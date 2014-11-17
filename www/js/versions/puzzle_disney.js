/*
 * делает из изображения пазл
 * @author: Samoylov Vasily
 * devphuzzle@gmail.com
 */

(function(_app){
		var   X_CNT	//количество клеток в ширину
		, Y_CNT		//количество клеток в высоту
		, nodes		//массив канв (ячеек)
		, canvasAr	//сюда положим массив из функций для прорисовки канв
		, xCellSz
		, yCellSz
		, container	//контейнер для канв
		, containerBox
		, callbacks	//калбаки на некоторые события
		, borderHeight = 6	
		, borderWidth = 6
		, animationStepX
		, animationStepY
		, phuzzleImg = new Image()
		, handlersAlreadySet = false
		, help = false
		;


	var canvasUtils = {
		checkBrowser: (function(){
			var node = document.createElement('canvas');
			return !!(node.getContext 
				&& node.addEventListener 
				&& node.getBoundingClientRect 
				&& Array.prototype.forEach
				);
			})()
			
		, resize: function (_elem, _x, _y) {
			_elem.width = _x;
			_elem.style.width = _x + 'px';
			_elem.height = _y;
			_elem.style.height = _y + 'px';
			return _elem;
		}
		/**
		 * Создания массива канв для пазлов
		 * @param {dom object} _containerNode - контейнер для канв
		 * @param {dom object} _img - картинка
		 * @param {array} _params - массив параметов для создания массива канв
		 * @param {array} _cb - калбак функции
		 * @returns {canvasUtils.createCanvasAr.Anonym$0|@exp;_cb@call;onError}
		 */	
		, createCanvasAr: function(_containerNode, _img, _params, _cb) {
			['borderWidth', 'borderHeight', 'cols', 'rows'].forEach(function(_e){
				if (!_params[_e]) {
					throw new Error('Отсутствует обязательный параметр ' + _e + ' при вызове canvasUtils.createCanvasAr');
				}
			});
			if (_img.width < 100 || _img.height < 100) {
				return _cb.onError('Картинка должна быть не менее 100px по меньшей стороне. Возможно ошибка загрузки.');
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
				canvasUtils.resize(_canvas, xCellSz, yCellSz);

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
				canvasUtils.resize(_canvas, xCellSz * X_CNT, yCellSz * Y_CNT);
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
				return _canvas;
			}
			return {
				canvasFactory: canvasFactory
				, redrawHelpCanvas: redrawHelpCanvas
				, cellWidth: xCellSz
				, cellHeight: yCellSz
			};
		}
	};
	/**
	 * Проверка фазлов на выигрыш
	 * @returns {undefined}
	 */
	var checkWin = function() {
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
			clearHandlers();
			if (callbacks.win) {
				_app.newFrame(function() {callbacks.win(timer.stop());});
			}
		}
	};		


	var timer = {
		stopFlag: true
		, begin: 0
		, start: function() {
			this.stopFlag = false;
			this.begin = Date.now();
		}
		, get: function() {
			return this.stopFlag ? this.begin : (Date.now() - this.begin);
		}
		, stop: function() {
			this.begin = this.get();
			this.stopFlag = true;
			return this.begin;
		}
		
	};
	
	var animation = {
		node: null
		, dx: 0
		, dy: 0
		, timer: 0
		, onMoved: null
		, move: function(_dx, _dy) {
			this.node.style.left = parseInt(this.node.style.left) + _dx + 'px';
			this.node.style.top = parseInt(this.node.style.top) + _dy + 'px';
		}
		, clear: function() {
			if (this.node) {
				clearTimeout(this.timer);
				this.timer = 0;
				this.move(this.dx, this.dy);
				this.onMoved(this.node);
			}
			this.node = null;
			this.dx = this.dy = 0;
		}
		, init: function(_dx, _dy, _node, _onMoved) {
			this.dx = _dx;
			this.dy = _dy;
			this.node = _node;
			this.onMoved = _onMoved;
			this.step();
		}
		, step: function() {
			if (Math.abs(this.dx) < animationStepX && Math.abs(this.dy) < animationStepY) {
				return this.clear();
			}	
			var dx = this.dx > 0 ? Math.min(this.dx, animationStepX) : Math.max(this.dx, -animationStepX)
				, dy = this.dy > 0 ? Math.min(this.dy, animationStepY) : Math.max(this.dy, -animationStepY)
				;
			this.move(dx, dy);	
			this.dx -= dx;
			this.dy -= dy;
			setTimeout(this.step.bind(this), 25);
		}
	};



	
	//Реакции на события
	function holdCell(_e) {
		if (_e.target.className == 'phuzzleCell') {
			handlers.hold(_e.pageX, _e.pageY, _e.target);
		}	
	}
	function unhold(_e) {
		handlers.unhold();
		_e.preventDefault();
		return false;
	}
	function hold(_e) {
		holdCell(_e);
		_e.preventDefault();
		return false;
	}	
	function mousemove(_e) {
		_app.newFrame(function(){handlers.move(_e.pageX, _e.pageY)});
	}
	function touchStart(_e) {
		holdCell(_e.touches[0]);
		_e.preventDefault();
		return false;
	}
	function touchMove(_e) {
		var touch = _e.touches[0];
		_app.newFrame(function(){handlers.move(touch.pageX, touch.pageY)});
		_e.preventDefault();
		return false;
	}

	/**
	 * реакция на события
	 * @type object
	 */
	var handlers = {
		 x: 0
		, y: 0	//где произошел захват
		, node: null
		, cellXy: null	//координаты клетки
		, isFree: function() {
			return this.node == null;
		}
		, hold: function(_x, _y, _node) {
			if (!this.isFree()) {
				return;
			}
			animation.clear();
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
			//из за возможного скролинга тут криво вычисляем
			//@todo надо подумать, как оптимизнуть
			var curContainerBox = container.getBoundingClientRect();
			var containerBoxLeft = window.pageXOffset + curContainerBox.left;
			var containerBoxTop = window.pageYOffset + curContainerBox.top;			
//console.log(containerBoxLeft, containerBoxTop, curContainerBox.left, curContainerBox.top);			
			//Определяем, над какой клеткой опустили мышь
			var changedCellX = Math.floor((this.x - containerBoxLeft)/xCellSz)
				, changedCellY  = Math.floor((this.y - containerBoxTop)/yCellSz)
				, target = null;
			if (nodes[changedCellX] && nodes[changedCellX][changedCellY]) {
				//существует клетка
				target = {node: nodes[changedCellX][changedCellY]
					, left: this.cellXy.x * xCellSz + 'px'
					, top: this.cellXy.y * yCellSz + 'px'
				};
				nodes[this.cellXy.x][this.cellXy.y] = nodes[changedCellX][changedCellY];
				nodes[changedCellX][changedCellY] = this.node;
			} else {
				changedCellX = this.cellXy.x;
				changedCellY = this.cellXy.y;
			}	
			var node = this.node;
			this.node = null;

			animation.init(changedCellX * xCellSz - parseInt(node.style.left)
				, changedCellY * yCellSz - parseInt(node.style.top) 
				, node
				, function(_node) {
					_node.style.opacity = 1;
					_node.style.zIndex = 0;
					if (target) {
						target.node.style.left = target.left;
						target.node.style.top = target.top;
					}
					//проверка на выигрыш
					checkWin();
				}
			);
	
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
	/**
	 * Установка реакций на события
	 * @returns {undefined}
	 */
	function setHandlers() {
		if (handlersAlreadySet) {
			return;
		}
		handlersAlreadySet = true;
		//Сразу установим обработчики
		if (!!('ontouchstart' in window)) {	//touch screen
			container.addEventListener('touchstart', touchStart);		
			container.addEventListener('touchmove', touchMove);
			container.addEventListener('touchend', unhold);		
			container.addEventListener('orientationchange', function() {
				//Без таймаута на моем планшете работает не верно
				setTimeout(phuzzleImgOnLoad, 200);
			});

		} else {	
			container.addEventListener('mousemove', mousemove);
			container.addEventListener('mouseup', unhold);
			container.addEventListener('mouseleave', unhold);
			container.addEventListener('mousedown', hold);		
		}	
	}
	function clearHandlers() {
		if (!handlersAlreadySet) {
			return;
		}
		handlersAlreadySet = false;
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
	}
	
	function phuzzleImgOnLoad() {
		canvasAr = canvasUtils.createCanvasAr(
				container
				, phuzzleImg
				, {borderWidth: borderWidth
					, borderHeight: borderHeight
					, cols: X_CNT
					, rows: Y_CNT
				}
				, callbacks
			)
			;
		xCellSz = canvasAr.cellWidth;
		yCellSz = canvasAr.cellHeight;
		animationStepX = Math.ceil(xCellSz/10);
		animationStepY = Math.ceil(yCellSz/10);

		setCanvasCells(X_CNT, Y_CNT, nodes);

		//Формируем канву-подсказку
		if (help && help.canvas) {
			canvasAr.redrawHelpCanvas(help.canvas);
		}
	} 

	function mixCanvasCells(_xCnt, _yCnt, _nodes) {
		//Перемешиваем
		var rndX, rndY, tmp;
		for (var x = 0; x < _xCnt; x ++) {
			for (var y = 0; y < _yCnt; y ++) {
				rndX = Math.floor(Math.random() * _xCnt);
				rndY = Math.floor(Math.random() * _yCnt);
				tmp = _nodes[rndX][rndY];
				_nodes[rndX][rndY] = _nodes[x][y];
				_nodes[x][y] = tmp;
			}
		}
	}
	function setCanvasCells(_xCnt, _yCnt, _nodes) {
		//Поставим канвы на места
		for (var x = 0; x < _xCnt; x ++) {
			for (var y = 0; y < _yCnt; y ++) {
				var canvas = _nodes[x][y]
					, id = _nodes[x][y].id
					, rx = id % X_CNT
					, ry = Math.floor(id/_xCnt)
					;
				canvas = canvasAr.canvasFactory(rx, ry, canvas); 
				canvas.style.left = x * xCellSz + 'px';
				canvas.style.top = y * yCellSz + 'px'; 
			}
		}	
	}			
	

	//Присоединяем фазлы к переданной переменной
	_app.phuzzle = {
		/**
		 * Иницилизация и запуск пазлов
		 * @param {string} _imgSrc УРЛ картинки для фазлов
		 * @param {object} _container узел делева документа, где будут собирать фазл
		 * @param {array} _xy количество строк и столбцов в фазле
		 * @param {object} _callbacks калбак функции
		 * @param {object} _helpNode узел дерева - "кнопка" для показа собранного фазла
		 * @returns {unresolved}
		 */
		run: function(_imgSrc, _container, _xy, _callbacks, _helpNode) {
			container = _container;

			container.className = '_phuzzle';

			X_CNT = _xy[0];
			Y_CNT = _xy[1];
			callbacks = _callbacks || {};
			if (!callbacks.onError) {
				callbacks.onError = function onError(_str) {
					container.innerHTML = '<div class="error">' + _str + '</div>';
					throw new Error(_str);
				};
			}
			
			//Проверяем возможность работы с канвой
			if (!canvasUtils.checkBrowser) {
				callbacks.onError('К сожалению ваш браузер не поддерживается.');
				return;
			}
			

			containerBox = container.getBoundingClientRect();
			
			//Создаем массив из канв
			nodes =	Array(X_CNT);
			for (var x = 0; x < X_CNT; x ++) {
				nodes[x] = Array(Y_CNT);
				for (var y = 0; y < Y_CNT; y ++) {
					var canvas = document.createElement('canvas');
					canvas.className = 'phuzzleCell';
					canvas.id = x + y * X_CNT;
					nodes[x][y] = canvas;
					container.appendChild(canvas);
				}
			}	
			
			mixCanvasCells(X_CNT, Y_CNT, nodes);
			setHandlers();	
			
			
			//Формируем канву-подсказку
			if (_helpNode) {
				help = {};
				help.node = _helpNode;
				help.canvas = document.createElement('canvas');
				container.appendChild(help.canvas);
				help.show = function (_e) {
					help.canvas.style.display = 'block';
					_e.preventDefault();
					return false;						
				};
				help.hide = function (_e) {
					help.canvas.style.display = 'none';
					_e.preventDefault();
					return false;						
				};
				help.trigger = function (_e) {
					return (help.canvas.style.display == 'none') ? help.show(_e) : help.hide(_e);
				};
				if (!!('ontouchstart' in window)) {	//touch screen
				   help.node.addEventListener('click', help.trigger);	
				   help.canvas.addEventListener('click', help.hide);

				} else {
					help.node.addEventListener('click', help.hide);	
					help.node.addEventListener('mousedown', help.show);		
					help.node.addEventListener('mouseup', help.hide);
					help.node.addEventListener('mouseleave', help.hide);
				}
			}
			
			
			phuzzleImg.addEventListener('load', function () {
				phuzzleImgOnLoad();
				if (callbacks.successLoad) {
					callbacks.successLoad();
				}
				timer.start();
			});	
			phuzzleImg.src = _imgSrc;
		}	
		, rerun: function() {
			mixCanvasCells(X_CNT, Y_CNT, nodes);
			setCanvasCells(X_CNT, Y_CNT, nodes);
			setHandlers();
			timer.start();
		}
		, getPassedTime: function() {
			return timer.get();
		}
	};
}(Site));
