/**
 * В этой игре необходимо переворачивать клетку горизонтально или вертикально, вместе со строкой или столбцом
 * @author: Samoylov Vasily
 * devphuzzle@gmail.com
 */
var phertish = (function($){
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

	//--- animator
	var animator = (function(){
		var canvas
			, ctx
			, canvasXY
			, angle
			, da = 3 * Math.PI / 180
			, emptyFunc = function(){}
			, animateFunc = emptyFunc
			, setNewCanvasFunc = emptyFunc
			, cbAfterAnimate = emptyFunc
			;
		var animateOx = function() {
			animateFunc = animateOx;
			//здесь угол должен быть всегда > 0 и < PI
			angle = Math.min(angle + da, PI);
			game.rotateOx(canvas, angle);
			if (PI == angle) {
				game.stateRevert(canvasXY.x, canvasXY.y, F_REVERT_OX);
				//canvas.setAttribute('state', parseInt(canvas.getAttribute('state')) ^ F_REVERT_OX);
				animateFunc = emptyFunc;
				cbAfterAnimate();
				setNewCanvasFunc();
				return;
			}
			App.newFrame(animateOx);
		};
		var animateOy = function() {
			animateFunc = animateOy;
			//здесь угол должен быть всегда > 0 и < PI
			angle = Math.min(angle + da, PI);
			game.rotateOy(canvas, angle);
			if (PI == angle) {
				game.stateRevert(canvasXY.x, canvasXY.y, F_REVERT_OY);
				//canvas.setAttribute('state', parseInt(canvas.getAttribute('state')) ^ F_REVERT_OY);
				animateFunc = emptyFunc;
				cbAfterAnimate();
				setNewCanvasFunc();
				return;
			}
			App.newFrame(animateOy);
		};
		
		var beginAnimate = function(_beginAngle, _flag, _functionForAnimate, _cbAfterAnimate){
			cbAfterAnimate = _cbAfterAnimate;
			angle = _beginAngle % (2 * PI);
			if (angle < 0) {
				angle += 2 * PI;
			}
			if (angle > PI) {
				game.stateRevert(canvasXY.x, canvasXY.y, _flag);
				angle = angle % PI;
			}
			if (angle < HALF_PI) {	//надо обратно двигать
				game.stateRevert(canvasXY.x, canvasXY.y, _flag);
				angle = PI - angle;
			}
			_functionForAnimate();
		}

		var obj = {
			init: function(_canvas){
				angle = PI;
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
			animator.beginAnimateOx(_angle, checkWin);
		}
		, unholdOy: function(_node, _angle) {
			animator.beginAnimateOy(_angle, checkWin);
		}
		, getWidth: function(_node) {
			return _node.width;
		}
		, getHeight: function(_node) {
			return _node.width;
		}
		, rotateOx: function(_node, _angle) {
			game.rotateOx(_node, _angle);
		}
		, rotateOy: function(_node, _angle) {
			game.rotateOy(_node, _angle);
		}
	});
	//--- end handlers
	
	var game = {
		data: null
		, X_SZ: 0
		, Y_SZ: 0
		, init: function(_containerNode, _cols, _rows, _mode) {
			this.X_SZ = _cols;
			this.Y_SZ = _rows;
			this.data = Array(this.X_SZ);
			for (var x = 0; x < this.X_SZ; x ++) {
				this.data[x] = Array(this.Y_SZ);
				for (var y = 0; y < this.Y_SZ; y ++) {
					var canvas = document.createElement('canvas');
					canvas.className = 'twelvecell';
					canvas.id = 'cell-' + x + '-' + y;
					_containerNode.appendChild(canvas);
					this.data[x][y] = {node: canvas, state: 0, x: x, y: y};
				}
			}
			this.getCollection = _mode ? this.getCross : this.getLine;
			//Перемешиваем
			if (!_mode) {
				// детские оч. простые, надо мешать по-другому
				for (var y = 1; y < this.Y_SZ; y +=2) {
					this.stateRevert(0, y - Math.round(Math.random()), F_ROTATE_OY );
				}
				for (var x = 1; x < this.X_SZ; x +=2) {
					this.stateRevert(x - Math.round(Math.random()), 0, F_ROTATE_OX );
				}
				
			} else {
				for (var x = 0; x < this.X_SZ; x +=2) {
					for (var y = 0; y < this.Y_SZ; y +=2) {
						this.stateRevert(x, y, Math.random() > .5 ? F_ROTATE_OX : F_ROTATE_OY);
					}
				}
			}	
		}
		, check: function() {
			for (var x = 0; x < this.X_SZ; x ++) {
				for (var y = 0; y < this.Y_SZ; y ++) {
					if (this.data[x][y].state) {
						return false;
					}
				}
			}
			return true;
		}
		, getLine: function(_x, _y, _shiftFlag) {
			var collection, i;
			if (F_ROTATE_OX == _shiftFlag) {
				collection = Array(this.Y_SZ)
				for (i = 0; i < this.Y_SZ; i ++) {
					collection[i] = this.data[_x][i];
				}	
			} else {
				collection = Array(this.X_SZ);
				for (i = 0; i < this.X_SZ; i ++) {
					collection[i] = this.data[i][_y];
				}	
			}
			return collection;
		} 
		, getCross: function(_x, _y, _shiftFlag) {
			var collection = [], i;
			for(i = 0; i < this.data[_x].length; i ++) {
				if (i != _y) {
					collection.push(this.data[_x][i]);
				}
			}
			for(i = 0; i < this.data.length; i ++) {
				if (i != _x) {
					collection.push(this.data[i][_y]);
				}
			}
			collection.push(this.data[_x][_y]);
			return collection;
		}
		, getCollection: null
		, getState: function(_x, _y) {
			return this.data[_x][_y].state;
		}
		, stateRevert: function(_x, _y, _flag) {
			this.getCollection(_x, _y, _flag).forEach(function(_obj){
				_obj.state ^= _flag;
			});	
		}
		, getNode: function(_x, _y) {
			return this.data[_x][_y].node;
		}
		, getNodeXY: function(_node) {
			var ar = _node.id.split('-');
			return {x: parseInt(ar[1]), y: parseInt(ar[2])};
		}
		, initialCanvas: function(_obj, _angle, _direction) {
			var node = _obj.node
				, ctx = _obj.node.getContext('2d');
			node.width = node.width;	//сброс канвы
			_angle = Math.abs(_angle % (2 * PI));
			if (_obj.state & F_REVERT_OX) {
				ctx.translate(node.width, 0);//Перенос точки начала координат
				ctx.scale(-1, 1);	//
			}
			if (_obj.state & F_REVERT_OY) {
				ctx.translate(0, node.height);//Перенос точки начала координат
				ctx.scale(1, -1);	//
			}
			if (_angle > HALF_PI && _angle < ONE_AND_HALF_PI) {
				if (_direction == F_ROTATE_OX) {
					ctx.translate(node.width, 0);//Перенос точки начала координат
					ctx.scale(-1, 1);	//
				} else {
					ctx.translate(0, node.height);//Перенос точки начала координат
					ctx.scale(1, -1);	//
				}
			}
			return _obj.node;
		}
		, rotateOy: function(_canvas, _angle) {
			var xy = this.getNodeXY(_canvas), _this = this;
			this.getCollection(xy.x, xy.y, F_ROTATE_OY).forEach(function(_obj){
				var canvas = _this.initialCanvas(_obj, _angle, F_ROTATE_OY)
					, visibleHeight = Math.abs(Math.cos(_angle) * canvas.height)
					; 
				canvasMethods.canvasFactory(_obj.x, _obj.y, canvas
					, {customDraw: function(_source, _target){
						canvas.getContext('2d')
							.drawImage(_source.img //Похоже картинка тоже рисуется относительно начала координат
								, _source.x, _source.y //смещение в исходном
								, _source.width, _source.height //высота и ширина вырезаемой части
								, 0, (canvas.height - visibleHeight)/2 //смещение в канве
								, canvas.width, visibleHeight //высота и ширина в канве
							);
						}		
					}
				);
			});	
		}
		, rotateOx: function(_canvas, _angle) {
			var xy = this.getNodeXY(_canvas), _this = this;
			this.getCollection(xy.x, xy.y, F_ROTATE_OX).forEach(function(_obj){
				var canvas = _this.initialCanvas(_obj, _angle, F_ROTATE_OX);
				var visibleWidth = Math.abs(Math.cos(_angle) * canvas.width);
				canvasMethods.canvasFactory(_obj.x, _obj.y, canvas
					, {customDraw: function(_source, _target){
						canvas.getContext('2d')
							.drawImage(_source.img //Похоже картинка тоже рисуется относительно начала координат
								, _source.x, _source.y //смещение в исходном
								, _source.width, _source.height //высота и ширина вырезаемой части
								, (canvas.width - visibleWidth)/2, 0 //смещение в канве
								, visibleWidth, canvas.height //высота и ширина в канве
							);
						}	
					}
				);
			});		
		}
	};
	
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
