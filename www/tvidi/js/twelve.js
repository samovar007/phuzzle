/**
 * В этой игре необходимо перемещать строки и столбцы, чтоб собрать картинку
 * Чем то напоминает кубик рубика
 * @author: Samoylov Vasily
 * devphuzzle@gmail.com
 */
if (checkBrowser) {
var twelve = (function($){
	var $container
		, containerNode
		, $containerIn
		, cellWidth, cellHeight
		, x, y
		, animationStepX, animationStepY
		, columns, rows
		, externalCb
		, helpNode
		, img
		, canvasAr
		, timer
		, helpCanvas
		;
	
	var game = {
		field: null
		, cols: 0
		, rows: 0
		, init: function(_cols, _rows) {
			this.cols = _cols;
			this.rows = _rows;
			this.field = Array(this.cols);	
			for(x = 0; x < this.cols; x++) {
				this.field[x] = Array(this.rows);
				for (y = 0; y < this.rows; y++) {
					this.field[x][y] = x * this.rows + y;
				}
			}
		}
		, check: function() {
			var win = true, x, y;
			for(x = 0; x < this.cols; x++) {
				if (!win) {
					break;
				}
				for (y = 0; y < this.rows; y++) {
					if (this.field[x][y] != x * this.rows + y) {
						win = false;
						break;
					}
				}
			}	
			return win;
		}
		, shiftLeft: function(_n) {
			var val = this.field[0][_n], x;
			for (x=1; x<this.cols; x++) {
				this.field[x-1][_n] = this.field[x][_n];
			}
			this.field[this.cols-1][_n] = val;
		}
		, shiftRight: function(_n) {
			var val = this.field[this.cols-1][_n], x;
			for (x=this.cols-2; x>=0; x--) {
				this.field[x+1][_n] = this.field[x][_n];
			}
			this.field[0][_n] = val;
		}
		, shiftUp: function(_n) {
			this.field[_n].push(this.field[_n].shift());
		}
		, shiftDown: function(_n) {
			var val = this.field[_n][this.rows-1], y;
			for (y=this.rows-2; y>=0; y--) {
				this.field[_n][y+1] = this.field[_n][y];
			}
			this.field[_n][0] = val;
		}
		, jumble: function(_q) {
			//Перемещивание 
			for (var i=0; i<_q; i++) {
				var rnd = Math.floor(Math.random() * 4 + 1);
				switch (rnd) {
					case 1: this.shiftUp(Math.floor(Math.random() * this.cols)); break;
					case 2: this.shiftDown(Math.floor(Math.random() * this.cols)); break;
					case 3: this.shiftLeft(Math.floor(Math.random() * this.rows)); break;
					case 4: this.shiftRight(Math.floor(Math.random() * this.rows)); break;
				}
			}
		}
	};	
	
	var DETECTING=1, COL=2, ROW=3;
	var rowcols = {
		x: 0	//где произошел захват
		, y: 0	
		, mode: 0	//режим (0, DETECTING=1, COL=2, ROW=3)
		, node: null
		, $collection: null
		, isFree: function() {
			return !this.mode;
		}
		, hold: function(_x, _y, _node) {
			if (!this.isFree()) {
				return;
			}
			this.x = _x;
			this.y = _y; 
			this.node = _node;
			this.mode = DETECTING;
		}
		, clear: function() {
			this.mode = this.x = this.y = 0;
			this.node = this.$collection = null;
		}
		, unhold: function(_cb) {
			if (this.isFree() || this.mode == DETECTING) {
				return this.clear();
			}	
			_cb = _cb || {};
			if (this.mode == ROW && _cb.unholdRow) {
				_cb.unholdRow(this.$collection);
			}
			if (this.mode == COL && _cb.unholdCol) {
				_cb.unholdCol(this.$collection);
			}
			return this.clear();
		}	
		, move:  function(_x, _y, _cb) {
			if (this.isFree()) {
				return;
			}
			_cb = _cb || {}
			var d;
			if (this.mode == DETECTING) {
				var dx = Math.abs(_x - this.x)
					, dy = Math.abs(_y - this.y);
				if (dx < cellWidth/20 && dy < cellHeight/20) {
					return; //рука дрогнула
				}	
				//надо определить, передвигаем колонку или столбец
				if (dx > dy) {
					this.mode = ROW;
					this.$collection = $('[row=' + this.node.getAttribute('row') + ']');
				} else {
					this.mode = COL;
					this.$collection = $('[col=' + this.node.getAttribute('col') + ']');
				}
			}
			if (this.mode == ROW) {
				d = _x - this.x;
				this.x = _x;
				if (_cb.moveRow) {
					_cb.moveRow(d, this.$collection);
				}
			} else {
				d = _y - this.y;
				this.y = _y;
				if (_cb.moveCol) {
					_cb.moveCol(d, this.$collection);
				}
			}
		}
	};
	
	//Реакции на события
	function unhold(_e) {
		rowcols.unhold(internalCb);
		_e.preventDefault();
		return false;
	}
	function hold(_e) {
		animation.clear();
		rowcols.hold(_e.pageX, _e.pageY, _e.target);
		_e.preventDefault();
		return false;
	}	
	function touchStart(_e) {
		animation.clear();
		var firstE = _e.originalEvent.touches[0];
		rowcols.hold(firstE.pageX, firstE.pageY, firstE.target);
		_e.preventDefault();
		return false;
	}
	function mousemove(_e) {
		App.newFrame(function(){rowcols.move(_e.pageX, _e.pageY, internalCb)});
		_e.preventDefault();
		return false;
	}
	function touchMove(_e) {
		var firstE = _e.originalEvent.touches[0];
		App.newFrame(function(){rowcols.move(firstE.pageX, firstE.pageY, internalCb)});
		_e.preventDefault();
		return false;
	}

	
	//--- callbacks
	var internalCb = {
		/**
		 * Калбак, вызываемый при перетаскивании строки
		 * @param {int} _d смещение
		 * @param {array} $_collection - перетаскиваемые ячейки
		 */
		moveRow: function(_d, $_collection) {
			var n = $_collection[0]
				, row = n.getAttribute('row')
				, dd = parseInt(n.style.left) - n.getAttribute('col') * cellWidth
				, shift = false;
			//Проверяем, нужно ли менять местами содержимое 
			//Идея такая: если произошел сдвиг более чем на 20% от клетки - меняем
			if (_d < 0 && dd+_d < -cellWidth/5) {
				shift = true;
				_d += cellWidth;
				game.shiftLeft(row);
			} else if (_d > 0 && _d + dd > cellWidth/5) {
				shift = true;
				_d -= cellWidth;
				game.shiftRight(row);

			} 
			if (shift) {
				$_collection.each(function(_idx, _node){
					var col = _node.getAttribute('col')
						, canvas = _node;
					if (-1 == col) {
						getCanvasByNumber(game.field[columns-1][row], canvas);
					} else if (columns == col) {
						getCanvasByNumber(game.field[0][row], canvas);
					} else {
						getCanvasByNumber(game.field[col][row], canvas);
					}
				});
			}
			//сам сдвиг
			$_collection.each(function(_idx, _node){
				_node.style.left = parseInt(_node.style.left) + _d + 'px';
			});
		}
		, moveCol: function(_d, $_collection) {
			var n = $_collection[0]
				, col = n.getAttribute('col')
				, dd = parseInt(n.style.top) - n.getAttribute('row') * cellHeight
				, shift = false;
			//Проверяем, нужно ли менять местами содержимое 
			//Идея такая: если произошел сдвиг более чем на 20% от клетки - меняем
			if (_d < 0 && dd+_d < -cellHeight/5) {
				shift = true;
				_d += cellHeight;
				game.shiftUp(col);
			} else if (_d > 0 && _d + dd > cellHeight/5) {
				shift = true;
				_d -= cellHeight;
				game.shiftDown(col);

			} 
			if (shift) {
				$_collection.each(function(_idx, _node){
					var row = _node.getAttribute('row')
						, canvas = _node;
					if (-1 == row) {
						getCanvasByNumber(game.field[col][rows -1], canvas);
					} else if (rows == row) {
						getCanvasByNumber(game.field[col][0], canvas);
					} else {
						getCanvasByNumber(game.field[col][row], canvas);
					}
				});
			}
			//сам сдвиг
			$_collection.each(function(_idx, _node){
				_node.style.top = parseInt(_node.style.top) + _d + 'px';
			});
		} 
		, unholdRow: function($_collection) {
			var n = $_collection[0];
			animation.init(n.getAttribute('col') * cellWidth - parseInt(n.style.left), 0 , $_collection);
		}
		, unholdCol: function ($_collection) {
			var n = $_collection[0];
			animation.init(0, n.getAttribute('row') * cellHeight - parseInt(n.style.top), $_collection);
		}
	};

	var animation = {
		$collection: null
		, dx: 0
		, dy: 0
		, timer: 0
		, moveCollection: function(_dx, _dy) {
			this.$collection.each(function(_idx, _node){
				_node.style.left = parseInt(_node.style.left) + _dx + 'px';
				_node.style.top = parseInt(_node.style.top) + _dy + 'px';
			});	
		}
		, clear: function() {
			if (this.$collection) {
				clearTimeout(this.timer);
				this.timer = 0;
				this.moveCollection(this.dx, this.dy);
				checkWin();
			}
			this.$collection = null;
			this.dx = this.dy = 0;
		}
		, init: function(_dx, _dy, $_collection) {
			this.dx = _dx;
			this.dy = _dy;
			this.$collection = $_collection;
			this.step();
		}
		, step: function() {
			if (Math.abs(this.dx) < animationStepX && Math.abs(this.dy) < animationStepY) {
				return this.clear();
			}	
			var dx = this.dx > 0 ? Math.min(this.dx, animationStepX) : Math.max(this.dx, -animationStepX)
				, dy = this.dy > 0 ? Math.min(this.dy, animationStepY) : Math.max(this.dy, -animationStepY)
				;
			this.moveCollection(dx, dy);	
			this.dx -= dx;
			this.dy -= dy;
			setTimeout(this.step.bind(this), 25);
		}
	};
	
	function onImageLoaded() {
		//надо определиться, какая сторона у картинки больше
		var more, less;
		if (columns > rows) {
			more = columns; 
			less = rows;
		} else {
			more = rows;
			less = columns;
		}
		if (img.width > img.height) {
			columns = more;
			rows = less;
		} else {
			columns = less;
			rows = more;
		}
		
		game.init(columns, rows);
		game.jumble(10);

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
	}
	
	function reshow() {
		//containerBox = container.getBoundingClientRect();
		$containerIn.html('');
		//Надо получить реальную длину и ширину, вычислить размеры ячеек, вычислить размер внутреннего блока
		canvasAr = App.createCanvasAr(containerNode
			, img
			, {borderWidth: 6
				, borderHeight: 6
				, cols: columns
				, rows: rows
			}
			, externalCb
		);
			
		cellWidth = canvasAr.cellWidth;	
		cellHeight = canvasAr.cellHeight;
		
		$containerIn.css({width: cellWidth * columns + 'px', height: cellHeight * rows + 'px'});
		animationStepX = Math.ceil(cellWidth/10);
		animationStepY = Math.ceil(cellHeight/10);
		$containerIn.html('');
		
		for (x=0; x<columns; x++) {
			createCell(x, -1, game.field[x][rows-1]).attr({row: -1, col: x}).appendTo($containerIn);
			for (y=0; y<rows; y++) {
				createCell(x, y, game.field[x][y]).attr({row: y, col: x}).appendTo($containerIn);
			}
			createCell(x, rows, game.field[x][0]).attr({row: rows, col: x}).appendTo($containerIn);
		}
		for (y=0; y<rows; y++) {
			createCell(-1, y, game.field[columns-1][y]).attr({row: y, col: -1}).appendTo($containerIn);
			createCell(columns, y, game.field[0][y]).attr({row: y, col: columns}).appendTo($containerIn);
		}

		//Формируем канву-подсказку
		if (helpCanvas) {
			canvasAr.redrawHelpCanvas(helpCanvas);
		}
	}
	function getCanvasByNumber(_num, _canvas) {
		return canvasAr.canvasFactory(parseInt(_num / rows), _num % rows, _canvas);
//		var canvas = canvasAr.canvasFactory(_num % columns, parseInt(_num / columns), _canvas)
//			, ctx = canvas.getContext("2d");
//		ctx.font = "normal normal 32px Tahoma";
//		ctx.fillText(_num + 1, 50, 50);
//		return canvas;
	}
	
	function createCell(_x, _y, _nodeN) {
		return $(getCanvasByNumber(_nodeN, document.createElement('canvas')))
			.addClass('twelvecell')
			.css({top: _y * cellHeight + 'px'
				, left: _x * cellWidth + 'px'
				, width: cellWidth + 'px'
				, height: cellHeight + 'px'
				, lineHeight: cellHeight + 'px'
				, fontSize: Math.floor(cellHeight/2) + 'px'
			});
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
			$containerIn.on('touchstart', touchStart);		
			$containerIn.on('touchmove', touchMove);
			$containerIn.on('touchend', unhold);	
			$(window).on('orientationchange', function() {
				//Без таймаута на моем планшете работает не верно
				setTimeout(reshow, 200);
			});
		} else {	
			$containerIn.on('mousemove', mousemove);
			$containerIn.on('mouseup', unhold);
			$containerIn.on('mouseleave', unhold);
			$containerIn.on('mousedown', hold);
		}	
	}
	function clearEventListener() {
		$containerIn.off('mousemove', mousemove);
		$containerIn.off('mouseup', unhold);
		$containerIn.off('mouseleave', unhold);
		$containerIn.off('mousedown', hold);
		$containerIn.off('touchstart', touchStart);		
		$containerIn.off('touchmove', touchMove);
		$containerIn.off('touchend', unhold);	
	}
	
	return {
		run: function(_imgSrc, _containerNode, _complexity, _callbacks, _helpNode) {
			columns = _complexity[0];
			rows = _complexity[1];
			helpNode = _helpNode

			externalCb = _callbacks || {};
			if (!externalCb.onError) {
				externalCb.onError = function onError(_str) {
					throw new Exception(_str);
					alert(_str)
				}
			}
			
			containerNode = _containerNode;
			$container = $(_containerNode);
			$container.html('');
			$containerIn = $('<div></div>')
				.css({overflow: 'hidden', margin: 0, padding: 0, border: 0, position: 'relative'})
				.appendTo($container);
			setEventListener();	
			img = new Image();
			img.addEventListener('load', onImageLoaded);
			img.src = _imgSrc;
		}
	};
})(jQuery);

}

