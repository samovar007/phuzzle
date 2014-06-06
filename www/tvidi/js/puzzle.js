/*
 * делает из изображения пазл
 * @author: Samoylov Vasily
 * devphuzzle@gmail.com
 */
if (checkBrowser) {
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
		, borderHeight = 6	
		, borderWidth = 6
		, animationStepX
		, animationStepY
		;
		
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

	var puzzle = {
		 x: 0
		, y: 0	//где произошел захват
		, node: null
		, cellXy: null	//координаты клетки
		, isFree: function() {
			return this.node == null;
		}
		, run: function(_imgSrc, _container, _xy, _callbacks, _helpNode) {
			X_CNT = _xy[0];
			Y_CNT = _xy[1];
			callbacks = _callbacks || {};
			if (!callbacks.onError) {
				callbacks.onError = function onError(_str) {
					throw new Exception(_str);
				}
			}
			container = _container;
			containerBox = container.getBoundingClientRect();
			
			//Создаем массив из канв
			nodes =	Array(X_CNT);
			for (var x = 0; x < X_CNT; x ++) {
				nodes[x] = Array(Y_CNT);
				for (var y = 0; y < Y_CNT; y ++) {
					var canvas = document.createElement('canvas');
					canvas.className = 'puzzleCell';
					canvas.id = x + y * X_CNT;
					nodes[x][y] = canvas;
					container.appendChild(canvas);
				}
			}	
			//Перемешиваем
			var rndX, rndY, tmp;
			for (var x = 0; x < X_CNT; x ++) {
				for (var y = 0; y < Y_CNT; y ++) {
					rndX = Math.floor(Math.random() * X_CNT);
					rndY = Math.floor(Math.random() * Y_CNT);
					tmp = nodes[rndX][rndY];
					nodes[rndX][rndY] = nodes[x][y];
					nodes[x][y] = tmp;
				}
			}	
			//Сразу установим обработчики
			if (!!('ontouchstart' in window)) {	//touch screen
				container.addEventListener('touchstart', touchStart);		
				container.addEventListener('touchmove', touchMove);
				container.addEventListener('touchend', unhold);		
				$(window).on('orientationchange', function() {
					//Без таймаута на моем планшете работает не верно
					setTimeout(reshow, 200);
				});
				
			} else {	
				container.addEventListener('mousemove', mousemove);
				container.addEventListener('mouseup', unhold);
				container.addEventListener('mouseleave', unhold);
				container.addEventListener('mousedown', hold);		
			}	
			//Формируем канву-подсказку
			var helpCanvas;
			if (_helpNode) {
				helpCanvas = document.createElement('canvas');
				container.appendChild(helpCanvas);
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
				   _helpNode.addEventListener('click', helpTrigger);	
				   helpCanvas.addEventListener('click', helpHide);

				} else {
					_helpNode.addEventListener('mousedown', helpShow);		
					_helpNode.addEventListener('mouseup', helpHide);
					_helpNode.addEventListener('mouseleave', helpHide);
				}
			}
			
			var img = new Image();
			function reshow() {
				var canvasAr = App.createCanvasAr(
						container
						, img
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
				
				//Поставим канвы на места
				for (var x = 0; x < X_CNT; x ++) {
					for (var y = 0; y < Y_CNT; y ++) {
						var canvas = nodes[x][y]
							, id=nodes[x][y].id
							, rx = id % X_CNT
							, ry = Math.floor(id/X_CNT)
							;
						canvas = canvasAr.canvasFactory(rx, ry, canvas); 
						canvas.style.left = x * xCellSz + 'px';
						canvas.style.top = y * yCellSz + 'px'; 
					}
				}	
				//Формируем канву-подсказку
				if (helpCanvas) {
					canvasAr.redrawHelpCanvas(helpCanvas);
				}
				
			} // reshow
			
			img.addEventListener('load', function () {
				
				reshow();
				timer = Date.now();
				if (callbacks.successLoad) {
					callbacks.successLoad();
				}
			});	
			img.src = _imgSrc;

			
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
			//Определяем, над какой клеткой опустили мышь
			var changedCellX = Math.floor((this.x - containerBox.left)/xCellSz)
				, changedCellY  = Math.floor((this.y - containerBox.top)/yCellSz)
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
					puzzle.checkWin();
				}
			);
	
		}
		, checkWin: function() {
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
					App.newFrame(function() {callbacks.win(Date.now() - timer)});
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
		App.newFrame(function(){puzzle.move(_e.pageX, _e.pageY)});
	}
	function touchStart(_e) {
		holdCell(_e.touches[0]);
		_e.preventDefault();
		return false;
	}
	function touchMove(_e) {
		var touch = _e.touches[0];
		App.newFrame(function(){puzzle.move(touch.pageX, touch.pageY)});
		_e.preventDefault();
		return false;
	}
	
	return puzzle;
}());

}