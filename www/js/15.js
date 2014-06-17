/* 
 * Пятнашки
 * @author: Samoylov Vasily
 * devphuzzle@gmail.com
 */
var fifteen = (function($){
	var columns = 4
		, rows = 4
		, helpNode, helpCanvas
		, containerNode, $container, $containerIn
		, img
		, cellWidth, cellHeight
		, canvasImgAr
		, canvases
		, externalCb
		, timer
		;
	
	var game = {
		field: null
		, cols: 0
		, rows: 0
		, blank: 15
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
			this.blank = this.cols * this.rows - 1;
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
		, changeCell: function(_x, _y, _dx, _dy) {
			var tmp = this.field[_x][_y]
				, x2 = _x + _dx
				, y2 = _y + _dy;
			this.field[_x][_y] = this.field[x2][y2];
			this.field[x2][y2] = tmp;
			return [x2, y2];
		}
		, shift: function(_x, _y) {
			if (this.blank == this.field[_x][_y]) {
				return false;
			}
			if (_x > 0 && this.blank == this.field[_x-1][_y]) {
				return this.changeCell(_x, _y, -1, 0);
			}
			if (_x+1 < this.cols && this.blank == this.field[_x+1][_y]) {
				return this.changeCell(_x, _y, 1, 0);
			}
			if (_y > 0 && this.blank == this.field[_x][_y-1]) {
				return this.changeCell(_x, _y, 0, -1);
			}
			if (_y+1 < this.rows && this.blank == this.field[_x][_y+1]) {
				return this.changeCell(_x, _y, 0, 1);
			}
			return false;
		}
		, jumble: function(_n) {
			//По-идее надо искать 15...
			var fifteen = [3, 3];
			for (; _n>0; _n --) {
				var d = Math.round(Math.random()) ? -1 : 1
					, x = fifteen[0]
					, y = fifteen[1]
					;
				if (Math.round(Math.random())) {//двигаем по x
					x += d;
					if (x < 0 || x >= this.cols) {
						x -= 2*d;
					}
				} else {
					y += d;
					if (y < 0 || y >= this.cols) {
						y -= 2*d;
					}
				}
				fifteen = [x, y];
				this.shift(x, y);
			}	
		}
	};	
	
	function onImageLoaded() {

		game.init(columns, rows);
		game.jumble(150);

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
		//containerBox = container.getBoundingClientRect();
		$containerIn.html('');
		//Надо получить реальную длину и ширину, вычислить размеры ячеек, вычислить размер внутреннего блока
		canvasImgAr = App.createCanvasAr(containerNode
			, img
			, {borderWidth: 6
				, borderHeight: 6
				, cols: columns
				, rows: rows
			}
			, externalCb
		);
			
		cellWidth = canvasImgAr.cellWidth;	
		cellHeight = canvasImgAr.cellHeight;
		
		$containerIn.css({width: cellWidth * columns + 'px', height: cellHeight * rows + 'px'});
		$containerIn.html('');
		
		for (x=0; x<columns; x++) {
			for (y=0; y<rows; y++) {
				createCell(x, y, game.field[x][y]).attr({row: y, col: x}).appendTo($containerIn);
			}
		}
		//Формируем канву-подсказку
		if (helpCanvas) {
			canvasImgAr.redrawHelpCanvas(helpCanvas);
		}
	}
	function getCanvasByNumber(_num, _canvas) {
		if (15 == +_num) {
			//Это не работает на мобильном браузере, пришлось делать fillRect
			//clearRect(0, 0, cellWidth, cellHeight);
			_canvas.getContext('2d').fillRect(0, 0, cellWidth, cellHeight);
			return _canvas;
		}
		return canvasImgAr.canvasFactory(parseInt(_num / rows), _num % rows, _canvas);
	}
	
	function createCell(_x, _y, _nodeN) {
		return $(getCanvasByNumber(_nodeN, canvases[_x][_y]))
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
		$containerIn.on('click', clickCell);
		if (!!('ontouchstart' in window)) {	//touch screen
			$(window).on('orientationchange', function() {
				//Без таймаута на моем планшете работает не верно
				setTimeout(reshow, 200);
			});
			$containerIn.on('touchmove', touchMove);
		} else {
			//$containerIn.on('mousemove', clickCell);
		}	
		$(window).on('resize', function resize() {
			reshow();
		});			
	}
	function clearEventListener() {
		$containerIn.off('click', clickCell);
		//$containerIn.off('mousemove', clickCell);
		if (!!('ontouchstart' in window)) {	//touch screen
			$containerIn.off('touchmove', touchMove);
		}
	};
	function shiftCell(_node) {
		if (_node.className != 'twelvecell') {
			return false;
		}	
		var row = +_node.getAttribute('row')
			, col = +_node.getAttribute('col')
			, res = game.shift(col, row);
			;
		if (!res) {
			return false;
		}
		getCanvasByNumber(game.field[res[0]][res[1]], canvases[res[0]][res[1]]);
		getCanvasByNumber(game.field[col][row], canvases[col][row]);
		checkWin();
		return true
	}
	function clickCell(_e) {
		shiftCell(_e.target);
		_e.preventDefault();
		return false;
	}
	function touchMove(_e) {
		var firstE = _e.originalEvent.touches[0];
		shiftCell(firstE.target);
		_e.preventDefault();
		return false;
	}
	


	return {
		run: function(_imgSrc, _containerNode, _callbacks, _helpNode) {
			helpNode = _helpNode;
			containerNode = _containerNode;
			$container = $(_containerNode);
			$container.html('');
			$containerIn = $('<div></div>')
				.css({overflow: 'hidden', margin: 0, padding: 0, border: 0, position: 'relative'})
				.appendTo($container);

			externalCb = _callbacks || {};
			if (!externalCb.onError) {
				externalCb.onError = function onError(_str) {
					throw new Exception(_str);
					alert(_str);
				};
			}
			canvases = Array(columns);
			for(var x = 0; x < columns; x ++) {
				canvases[x] = Array(rows);
				for (var y=0; y<rows; y ++) {
					canvases[x][y] = document.createElement('canvas');
				}
			}


			setEventListener();	
			img = new Image();
			img.addEventListener('load', onImageLoaded);
			img.src = _imgSrc;
		}
	};

}(jQuery));