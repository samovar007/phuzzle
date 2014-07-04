/**
 * В этой игре необходимо разправить сложенные 
 * @author: Samoylov Vasily
 * devphuzzle@gmail.com
 */
var untuck = (function($){
	var $container
		, containerNode
		, cellWidth, cellHeight
		, x, y
		, columns, rows
		, externalCb
		, helpNode
		, img
		, canvasMethods
		, timer
		, helpCanvas
		, game
		;

	
	var F_REVERT_OY = F_ROTATE_OY = 0x1
		, F_REVERT_OX = F_ROTATE_OX = 0x2
		, PI = Math.PI
		, HALF_PI = PI/2
		, ONE_AND_HALF_PI = 3 * PI / 2
		, DA = 9 * PI / 180
		;

	//--- animator
	var animator = (function(){
		var canvas
			, ctx
			, canvasXY
			, angle
			, da 
			, emptyFunc = function(){}
			, animateFunc = emptyFunc
			, setNewCanvasFunc = emptyFunc
			, cbAfterAnimate = emptyFunc
			, direction
			, stopAngle //угол, при достижении которого анимация прекращается
			, dState	//-1 или +1 после окончания анимации
			;
		var animateOx = function() {
			animateFunc = animateOx;
			//надо, чтоб угол не перешел через stopAngle
			angle += da;
			if (da < 0) {
				angle = Math.max(angle, stopAngle);
			} else {
				angle = Math.min(angle, stopAngle);
			}
			game.rotateOx(canvas, angle);
			if (stopAngle == angle) {
				game.addState(canvasXY.x, canvasXY.y, F_ROTATE_OX, dState);
				animateFunc = emptyFunc;
				cbAfterAnimate();
				setNewCanvasFunc();
				return;
			}
			App.newFrame(animateOx);
		};
		var animateOy = function() {
			animateFunc = animateOy;
			//надо, чтоб угол не перешел через stopAngle
			angle += da;
			if (da < 0) {
				angle = Math.max(angle, stopAngle);
			} else {
				angle = Math.min(angle, stopAngle);
			}
//			if (stopAngle == angle) {
//console.log(stopAngle == PI);				
//			}
			game.rotateOy(canvas, angle);
			if (stopAngle == angle) {
				game.addState(canvasXY.x, canvasXY.y, F_ROTATE_OY, dState);
				animateFunc = emptyFunc;
				cbAfterAnimate();
				setNewCanvasFunc();
				return;
			}
			App.newFrame(animateOy);
		};
		
		var beginAnimate = function(_beginAngle, _flag, _functionForAnimate, _cbAfterAnimate) {
			cbAfterAnimate = _cbAfterAnimate;

			direction = _beginAngle > 0;
			if (_beginAngle > 0) {
				angle = Math.min(_beginAngle, PI);
			} else {
				angle = Math.max(_beginAngle, -PI);
			}

			if (Math.abs(angle) > HALF_PI) {
				if (direction) {
					da = DA;
					stopAngle = PI;
					dState = 1;
				} else {
					da = -DA;
					stopAngle = -PI;
					dState = -1;
				}	
			} else {
				da = direction ? -DA : DA;
				stopAngle = 0;
				dState = 0;
			}
//console.log('angle = ', angle, 'stopAngle = ', stopAngle, 'da = ', da, 'dState = ', dState);			
			_functionForAnimate();
		}

		var obj = {
			init: function(_canvas){
				angle = stopAngle;
				setNewCanvasFunc = function() {
					//Эта функция нужна из-за того, 
					//что в конце анимации происходит изменение состояния канвы
					canvas = _canvas;
					ctx = canvas.getContext('2d');
					canvasXY = game.getNodeXY(canvas);
					setNewCanvasFunc = emptyFunc;
				}
				if (animateFunc == emptyFunc) {
					setNewCanvasFunc();
				} 
				return this;
			}
			, beginAnimateOx: function(_angle, _cbAfterAnimate) {
				beginAnimate(_angle, F_REVERT_OX, animateOx, _cbAfterAnimate);
			} 
			, beginAnimateOy: function(_angle, _cbAfterAnimate) {
				beginAnimate(_angle, F_REVERT_OY, animateOy, _cbAfterAnimate);
			}
		};
		
		return obj;
	}());
	//--- end animator
	
	//--- handlers
	var handlers = (function(_callbacks) {
		var DETECTING=1
			, OX=2
			, OY=3
			;
		var holdX
			, holdY
			, node
			, direction
			, lastAngle
			;
		_callbacks = _callbacks || {};
		
		var clear = function() {
			direction = holdX = holdY = lastAngle = 0;
			node = null;
		};
		var isFree = function() {
			return !direction;
		};
		var hold = function(_x, _y, _node) {
			if (_node.tagName.toLowerCase() != 'canvas') {
				return;
			}
			holdX = _x;
			holdY = _y; 
			node = _node;
			direction = DETECTING;
			_callbacks.hold(node);
		};
		var unhold = function() {
			if (DETECTING == direction) {
				return clear();
			}	
			if (OX == direction) {
				_callbacks.unholdOx(node, lastAngle);
			}
			if (OY == direction) {
				_callbacks.unholdOy(node, lastAngle);
			}
			return clear();
		};	
		var move = function(_x, _y) {
			if (isFree()) {
				return;
			}
			var width = _callbacks.getWidth(node)
				, height = _callbacks.getHeight(node)
				, oxBorder = width/20
				, oyBorder = height/20
				, dx = Math.abs(_x - holdX)
				, dy = Math.abs(_y - holdY)
				, angle
				;
				
			if (dx < oxBorder && dy < oyBorder) {
//				direction = DETECTING;
//				_callbacks.rotateOx(node, 0);
				return; //рука дрогнула 
			} else if (DETECTING == direction) {
				//надо определить, передвигаем колонку или столбец
				if (dx > dy) {
					direction = OX;
				} else {
					direction = OY;
				}
			}
			
			if (direction == OX) {
				lastAngle = (_x - holdX) * 2 * PI/width;
				_callbacks.rotateOx(node, lastAngle);
			} else {
				lastAngle = (_y - holdY) * 2 * PI/height;
				_callbacks.rotateOy(node, lastAngle);
			}
		};
		return {
			mousedown: function(_e) {
				hold(_e.pageX, _e.pageY, _e.target);
				_e.preventDefault();
				return false;
			}
			, mouseup: function(_e) {
				unhold();
				_e.preventDefault();
				return false;
			}
			, mousemove: function(_e) {
				App.newFrame(function(){move(_e.pageX, _e.pageY);});
				_e.preventDefault();
				return false;
			}
			, touchStart: function(_e) {
				var firstE = _e.originalEvent.touches[0];
				hold(firstE.pageX, firstE.pageY, firstE.target);
				_e.preventDefault();
				return false;
			}
			, touchMove: function(_e) {
				var firstE = _e.originalEvent.touches[0];
				App.newFrame(function(){move(firstE.pageX, firstE.pageY);});
				_e.preventDefault();
				return false;
			}
		};
	})({
		hold: function(_node) {
			animator.init(_node);
		}
		, unholdOx: function(_node, _angle) {
			animator.beginAnimateOy(_angle, checkWin);
		}
		, unholdOy: function(_node, _angle) {
			animator.beginAnimateOx(_angle, checkWin);
		}
		, getWidth: function(_node) {
			return _node.width;
		}
		, getHeight: function(_node) {
			return _node.width;
		}
		, rotateOx: function(_node, _angle) {
			game.rotateOy(_node, _angle);
		}
		, rotateOy: function(_node, _angle) {
			game.rotateOx(_node, _angle);
		}
	});
	//--- end handlers
	
	var game = (function() {
		var X_SZ = 0
			, Y_SZ = 0
			, data = null
			, getCollection = null
			, getLineCollection = function(_x, _y, _shiftFlag) {
				var collection, i;
				if (F_ROTATE_OX == _shiftFlag) {
					collection = Array(Y_SZ)
					for (i = 0; i < Y_SZ; i ++) {
						collection[i] = data[_x][i];
					}	
				} else {
					collection = Array(X_SZ);
					for (i = 0; i < X_SZ; i ++) {
						collection[i] = data[i][_y];
					}	
				}
				return collection;
			} 
			, getCrossCollection = function(_x, _y, _shiftFlag) {
				var collection = [], i;
				for(i = 0; i < data[_x].length; i ++) {
					if (i != _y) {
						collection.push(data[_x][i]);
					}
				}
				for(i = 0; i < data.length; i ++) {
					if (i != _x) {
						collection.push(data[i][_y]);
					}
				}
				collection.push(data[_x][_y]);
				return collection;
			}
		;	
		/**
		 * отдает начало той части картинки, которая видима в переданном состоянии
		 */	
		var getOffsetProportion = function(_state) {
			var res = 0
				, absState = Math.abs(_state)
				, negative = _state < 0
				, odd = absState%2
				;
			if (_state) {
				if (odd == negative) { // (!odd && !negative) || (odd && negative)
					res = Math.pow(2,-(absState));
				}
				res += getOffsetProportion(_state - (negative ? -1 : 1));
			}
			return res;
		};	
		/**
		 * вычисляет видимую часть и необходимые трансформации канвы, исходя из состояния сложенности
		 * по одной из координат
		 * без учета угла
		 */
		var calculateCoords = function(_state, _imgBegin, _imgLineSz, _canvasLineSz) {
			var absState = Math.abs(_state)
				, foldPart = Math.pow(2,-absState)
				, tgtSz = Math.round(_canvasLineSz * foldPart)
				, retObj = 
					{ tgt: {begin: 0, sz: tgtSz}
					, src: {begin: _imgBegin + Math.round(_imgLineSz  * getOffsetProportion(_state))
						, sz: Math.round(_imgLineSz * foldPart)
					}
				}
				;
			if (absState % 2) {
				retObj.translate =  (_state < 0) ? tgtSz :  _canvasLineSz;
				retObj.scale = -1;
			} else {
				retObj.translate =  (_state < 0) ? 0 : _canvasLineSz - tgtSz;
				retObj.scale = 1;	//нет масштабирования
			}	
			return retObj;
		};
		/**
		 * вычисляет позиции статической и поворачиваемой части 
		 * по одной из координат
		 */
		var calculateFold = function(_info, _angle, _direction) {
			//---
			//изображение делится на 2 части: подвижная и неподвижная
			//надо учитывать трансформации при определении начала рисования в канве.

			var retObj = { stable: null, rotate: null, translate: 0, scale: 1};

			var wasScaleThisCoord = (_info.scale != 1)
				//высота неподвижной части (половина от общей)
				, stableTgtSz = Math.round(_info.tgt.sz/2) 
				//полная высота поворачиваемой части (половина от общей)
				, auxRotateTgtSz = _info.tgt.sz - stableTgtSz	
				//видимая высота (с учетом угла наклона)
				, rotateTgtSz = Math.abs(Math.cos(_angle)) * auxRotateTgtSz	
				//высота неподвижной части картинки (половина от общей высоты)
				, stableSrcSz = Math.round(_info.src.sz/2)
				//высота подвижной части картинки (половина от общей высоты)
				, rotateSrcSz = _info.src.sz - stableSrcSz
				;

			//далее переменные, вычисляемые по условию
			var stableTgtBegin, rotateTgtBegin, stableSrcBegin, rotateSrcBegin;		
			if (wasScaleThisCoord != _direction) {
				//условие - сокращенное от такого: (wasScaleThisCoord && (FOLD_UP == _direction)) || (!wasScaleThisCoord && (FOLD_DOWN == _direction))
				//если wasScaleThisCoord, то мы делали масштабирование и меняли верх и низ местами
				//если масштабирования не было и складываем вниз, то начало поворачиваемой области 
				//	начинается от начала рисунка (зависит от угла поворота)
				stableTgtBegin = _info.tgt.begin + auxRotateTgtSz;
				rotateTgtBegin = _info.tgt.begin  + (auxRotateTgtSz - rotateTgtSz);
				stableSrcBegin = _info.src.begin + rotateSrcSz;
				rotateSrcBegin = _info.src.begin;
			} else {
				stableTgtBegin = _info.tgt.begin;
				rotateTgtBegin = stableTgtBegin + stableTgtSz;
				stableSrcBegin = _info.src.begin;
				rotateSrcBegin = stableSrcBegin + stableSrcSz;
			}
			if (Math.abs(_angle) > HALF_PI) {
				retObj.translate = wasScaleThisCoord != _direction ? stableTgtBegin + rotateTgtSz : stableTgtSz;
				retObj.scale = -1;	
				rotateTgtBegin = 0;
			}
			retObj.stable = {
				src: {	begin: stableSrcBegin, sz: stableSrcSz }
				, tgt: { begin: stableTgtBegin, sz: stableTgtSz	}
			};
			retObj.rotate = {
				src: { begin: rotateSrcBegin, sz: rotateSrcSz}
				, tgt: { begin: rotateTgtBegin, sz: rotateTgtSz}
			};

			return retObj;
		};
		/**
		 * Вспомогательная функция для уменьшения кода
		 */
		var myDrawImage = function(_ctx, _xSrcInfo, _ySrcInfo, _xTgtInfo, _yTgtInfo) {
			if (_xSrcInfo.sz < 1 || _ySrcInfo.sz < 1 || _xTgtInfo.sz < 1 || _yTgtInfo.sz < 1) {
				return;
			}
			//часть рисунка, которая должна оставаться на месте
			_ctx.drawImage(img //Похоже картинка тоже рисуется относительно начала координат
					, _xSrcInfo.begin, _ySrcInfo.begin //смещение в исходном
					, _xSrcInfo.sz, _ySrcInfo.sz //высота и ширина вырезаемой части
					, _xTgtInfo.begin, _yTgtInfo.begin //смещение в канве
					, _xTgtInfo.sz, _yTgtInfo.sz //высота и ширина в канве
				);
		};
		
		var writeBorder = function(_canvas) {
			var ctx = _canvas.getContext('2d');
			ctx.strokeStyle="#777777";
			ctx.strokeRect(0, 0, _canvas.width, _canvas.height);
		}
			
			
		return {
			init: function(_containerNode, _cols, _rows, _mode) {
				X_SZ = _cols;
				Y_SZ = _rows;
				data = Array(X_SZ);
				for (var x = 0; x < X_SZ; x ++) {
					data[x] = Array(Y_SZ);
					for (var y = 0; y < Y_SZ; y ++) {
						var canvas = document.createElement('canvas');
						canvas.className = 'twelvecell';
						canvas.id = 'cell-' + x + '-' + y;
						_containerNode.appendChild(canvas);
						data[x][y] = {node: canvas, state: {x: 0, y:0}, x: x, y: y};
					}
				}
				getCollection = _mode ? getCrossCollection : getLineCollection;
	//return;	//без перемешиваниия			
				//Перемешиваем
				if (!_mode) {
					// детские оч. простые, надо мешать по-другому
					for (var y = 1; y < Y_SZ; y +=2) {
						//надо addState использовать
						//this.stateRevert(0, y - Math.round(Math.random()), F_ROTATE_OY );
					}
					for (var x = 1; x < X_SZ; x +=2) {
						//this.stateRevert(x - Math.round(Math.random()), 0, F_ROTATE_OX );
					}

				} else {
					for (var x = 0; x < X_SZ; x +=2) {
						for (var y = 0; y < Y_SZ; y +=2) {
							this.addState(x, y
								, Math.random() > .5 ? F_ROTATE_OX : F_ROTATE_OY
								, Math.random() > .7 ? 1 : -1);
							//this.stateRevert(x, y, Math.random() > .5 ? F_ROTATE_OX : F_ROTATE_OY);
						}
					}
				}	
			}
			, check: function() {
				for (var x = 0; x < X_SZ; x ++) {
					for (var y = 0; y < Y_SZ; y ++) {
						if (data[x][y].state.x || data[x][y].state.y) {
							return false;
						}
					}
				}
				return true;
			}
			, addState: function(_x, _y, _flag, _state) {
				if (_flag == F_ROTATE_OX) {
					getCollection(_x, _y, _flag).forEach(function(_obj){
						_obj.state.x += _state;
					});	
				} else {
					getCollection(_x, _y, _flag).forEach(function(_obj){
						_obj.state.y += _state;
					});	
				}
			}

			, getNode: function(_x, _y) {
				return data[_x][_y].node;
			}
			, getNodeXY: function(_node) {
				var ar = _node.id.split('-');
				return {x: parseInt(ar[1]), y: parseInt(ar[2])};
			}
			, rotateOy: function(_canvas, _angle) {
				var xy = this.getNodeXY(_canvas)
					, collection = getCollection(xy.x, xy.y, F_ROTATE_OY)
					;
				var _direction = _angle>0;
				
				if (Math.abs(_angle) > PI) {
					_angle = _direction ? PI : -PI;
				}
				//todo: здесь надо пробежаться по коллекции и посмотреть на статусы
				//возможно и не здесь, т.к. надо как-то возвращать эти данные наружу
				//возможно, если статус очень большой (abs), то просто ничего не выводить
				collection.forEach(function(_obj){
					
					//todo: !!!здесь надо определять, это сложение или раскладывание!!!
					//при этом как то менять угол?!!
					var virtState = _obj.state.y
						, virtAngle = _angle
						, virtDirection = _direction
						;
					if (_angle && virtState && (_direction == (virtState < 0))) {
						//когда мы раскладываем, то меняем виртуальное состояние
						if (_direction) {
							virtState +=1;
							virtAngle = PI - _angle;
						} else {
							virtState -=1;
							virtAngle = -PI - _angle;
						}
						virtDirection = !_direction;
					}
						
					canvasMethods.canvasFactory(_obj.x, _obj.y, _obj.node
						, {customDraw: function(_source, _target){
								var canvas = _obj.node
									, ctx = canvas.getContext('2d')
									, infoX = calculateCoords(virtState, _source.x, _source.width, _target.width)
									, infoY = calculateCoords(_obj.state.x, _source.y, _source.height, _target.height)
									;
								//сброс трансформаций и очистка канвы	
								canvas.width = canvas.width;	
								//рисуем прямоугольник
								writeBorder(_obj.node);

								//переносим точку начала координат
								if (infoX.translate || infoY.translate) {
									ctx.translate(infoX.translate, infoY.translate);
								}	
								//надо ли переварачивать изображение
								if (infoX.scale != 1 || infoY.scale != 1) {
									ctx.scale(infoX.scale, infoY.scale);
								}
								//---
								//изображение делится на 2 части: подвижная и неподвижная
								//надо учитывать трансформации при определении начала рисования в канве.
								var rInfo = calculateFold(infoX, virtAngle, virtDirection);
								myDrawImage(ctx, rInfo.stable.src, infoY.src, rInfo.stable.tgt, infoY.tgt);
								//трансформация оставшейся части
								//todo: для большего реализма должен показываться другой кусок рисунка 
								//+ поворот только если выше не поворачивали!
								if (rInfo.translate) {
									ctx.translate(rInfo.translate, 0);
									ctx.scale(rInfo.scale, 1);
								}
								//часть рисунка, которая должна вращаться		
								myDrawImage(ctx, rInfo.rotate.src, infoY.src, rInfo.rotate.tgt, infoY.tgt);
							}		
						}
					);
				});	
			}
			, rotateOx: function(_canvas, _angle) {
				var xy = this.getNodeXY(_canvas)
					, collection = getCollection(xy.x, xy.y, F_ROTATE_OX)
					;
				var _direction = _angle>0;
				if (Math.abs(_angle) > PI) {
					_angle = _direction ? PI : -PI;
				}
				//todo: здесь надо пробежаться по коллекции и посмотреть на статусы
				//возможно и не здесь, т.к. надо как-то возвращать эти данные наружу
				//возможно, если статус очень большой (abs), то просто ничего не выводить
				collection.forEach(function(_obj){
					//todo: !!!здесь надо определять, это сложение или раскладывание!!!
					//при этом как то менять угол?!!
					var virtState = _obj.state.x
						, virtAngle = _angle
						, virtDirection = _direction
						;
					if (_angle && virtState && (_direction == (virtState < 0))) {
						//когда мы раскладываем, то меняем виртуальное состояние
						if (_direction) {
							virtState +=1;
							virtAngle = PI - _angle;
						} else {
							virtState -=1;
							virtAngle = -PI - _angle;
						}
						virtDirection = !_direction;
					}
						
					canvasMethods.canvasFactory(_obj.x, _obj.y, _obj.node
						, {customDraw: function(_source, _target){
								var canvas = _obj.node
									, ctx = canvas.getContext('2d')
									, infoX = calculateCoords(_obj.state.y, _source.x, _source.width, _target.width)
									, infoY = calculateCoords(virtState, _source.y, _source.height, _target.height)
									;
								//сброс трансформаций и очистка канвы	
								canvas.width = canvas.width;	
								//рисуем прямоугольник
								writeBorder(_obj.node);
								//переносим точку начала координат
								if (infoX.translate || infoY.translate) {
									ctx.translate(infoX.translate, infoY.translate);
								}	
								//надо ли переварачивать изображение
								if (infoX.scale != 1 || infoY.scale != 1) {
									ctx.scale(infoX.scale, infoY.scale);
								}
								//---
								//изображение делится на 2 части: подвижная и неподвижная
								//надо учитывать трансформации при определении начала рисования в канве.
								var rInfo = calculateFold(infoY, virtAngle, virtDirection);
								myDrawImage(ctx, infoX.src, rInfo.stable.src, infoX.tgt, rInfo.stable.tgt);
								//трансформация оставшейся части
								//todo: для большего реализма должен показываться другой кусок рисунка 
								//+ поворот только если выше не поворачивали!
								if (rInfo.translate) {
									ctx.translate(0, rInfo.translate);
									ctx.scale(1, rInfo.scale);
								}
								//часть рисунка, которая должна вращаться		
								myDrawImage(ctx, infoX.src, rInfo.rotate.src, infoX.tgt, rInfo.rotate.tgt);
							}		
						}
					);
				});	
			}
		};
	}());	
	
	function onImageLoaded() {
		//Формируем канву-подсказку
		if (helpNode) {
			helpCanvas = document.createElement('canvas');
			containerNode.appendChild(helpCanvas);
			function helpShow(_e) {
				helpCanvas.style.display = 'block';
				_e.preventDefault();
				return false;						
			}
			function helpHide(_e) {
				helpCanvas.style.display = 'none';
				_e.preventDefault();
				return false;						
			}
			function helpTrigger(_e) {
				return (helpCanvas.style.display == 'none') ? helpShow(_e) : helpHide(_e);
			}
			if (!!('ontouchstart' in window)) {	//touch screen
			   helpNode.addEventListener('click', helpTrigger);	
			   helpCanvas.addEventListener('click', helpHide);

			} else {
				helpNode.addEventListener('mousedown', helpShow);		
				helpNode.addEventListener('mouseup', helpHide);
				helpNode.addEventListener('mouseleave', helpHide);
			}
		}

		timer = Date.now();
		reshow();
		if (externalCb.successLoad) {
			externalCb.successLoad();
		}
	}
	
	function reshow() {
		//Надо получить реальную длину и ширину, вычислить размеры ячеек, вычислить размер внутреннего блока
		canvasMethods = App.createCanvasAr(containerNode
			, img
			, {borderWidth: 0
				, borderHeight: 0
				, cols: columns
				, rows: rows
			}
			, externalCb
		);
			
		cellWidth = canvasMethods.cellWidth;	
		cellHeight = canvasMethods.cellHeight;
		for (x=0; x<columns; x++) {
			for (y=0; y<rows; y++) {
				var canvas = game.getNode(x, y);
				App.resizeCanvas(canvas, cellWidth, cellHeight);
				canvas.style.top = y * cellHeight + 'px';
				canvas.style.left= x * cellWidth + 'px';
				game.rotateOx(canvas, 0);
			}
		}

		//Формируем канву-подсказку
		if (helpCanvas) {
			canvasMethods.redrawHelpCanvas(helpCanvas);
		}
	}

	function checkWin() {
		if (!game.check()) {
			return;
		}
		clearEventListener();
		App.newFrame(function() {externalCb.win(Date.now() - timer);});
	}
	
	function setEventListener() {
		if (!!('ontouchstart' in window)) {	//touch screen
			$container.on('touchstart', handlers.touchStart);		
			$container.on('touchmove', handlers.touchMove);
			$container.on('touchend', handlers.mouseup);	
			$(window).on('orientationchange', function() {
				//Без таймаута на моем планшете работает не верно
				setTimeout(reshow, 200);
			});
		} else {	
			$container.on('mousedown', handlers.mousedown);		
			$container.on('mousemove', handlers.mousemove);
			$container.on('mouseup', handlers.mouseup);
			$container.on('mouseleave', handlers.mouseup);
		}	
		$(window).on('resize', function resize() {
			reshow();
		});			
	}
	function clearEventListener() {
		$container.off('mousedown', handlers.mousedown);
		$container.off('mousemove', handlers.mousemove);
		$container.off('mouseup', handlers.mouseup);
		$container.off('mouseleave', handlers.mouseup);
		$container.off('touchstart', handlers.touchStart);		
		$container.off('touchmove', handlers.touchMove);
		$container.off('touchend', handlers.mouseup);	
	}
	
	return {
		run: function(_imgSrc, _containerNode, _complexity, _callbacks, _helpNode) {
			
			columns = _complexity[0];
			rows = _complexity[1];
			helpNode = _helpNode;


			externalCb = _callbacks || {};
			if (!externalCb.onError) {
				externalCb.onError = function onError(_str) {
					throw new Exception(_str);
					alert(_str);
				};
			}
			
			containerNode = _containerNode;
			$container = $(_containerNode);
			$container.html('');
			
			game.init(_containerNode, columns, rows, _complexity[2]);
			//game.jumble(10);

			setEventListener();	
			img = new Image();
			img.addEventListener('load', onImageLoaded);
			img.addEventListener('error', function() {
				App.cover.off();
				alert('Ошибка загрузки изображения');
			});
			img.src = _imgSrc;
		}
	};
})(jQuery);
