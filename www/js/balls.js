/* 
 * @author: Samoylov Vasily
 * devphuzzle@gmail.com
 */

var ballsGame = (function() {
	var F_FREE = 0x1, F_WALL = 0x2, F_PROCESS = 0x4, F_MARKED = 0x8, F_FISHKA = 0x10;
	
	function resizeCanvas(_elem, _x, _y) {
		_elem.width = _x;
		_elem.style.width = _x + 'px';
		_elem.height = _y;
		_elem.style.height = _y + 'px';
		return _elem;
	}

	function createCanvas(_container, _class) {
		var node = document.createElement('canvas');
		if (_class) {
			node.className = _class;
		}	
		_container.appendChild(node);
		return node;
	}
	
	function createNode(_tagName, _class, _style) {
		var node = document.createElement(_tagName);
		node.className = _class;
		for (var prop in _style) {
			if (_style.hasOwnProperty(prop)) {
				node.style[prop] = _style[prop];
			}	
		}
		return node;
	}

	/**
	 * Создает объект поля игры
	 * @param {DOM object} _container
	 * @param {Integer} _cellSz
	 * @param {Integer} _FULLWIDTH
	 * @param {Integer} _FULLHEIGHT
	 * @returns {Object}
	 */
	var createField = function(_container, _cellSz, _FULLWIDTH, _FULLHEIGHT){
		
		var cells = Array(_FULLWIDTH)
			, node = resizeCanvas(createCanvas(_container), _cellSz * _FULLWIDTH, _cellSz * _FULLHEIGHT)
			, ctx = node.getContext('2d')
		
		for (var x=0; x<_FULLWIDTH; x++) {
			cells[x] = Array(_FULLHEIGHT);
			for (var y=1; y < _FULLHEIGHT - 1; y ++) {
				cells[x][y] = F_FREE;
			}
			cells[x][0] = F_WALL;
			cells[x][_FULLHEIGHT - 1] = F_WALL;
		}
		for (var y=0; y < _FULLHEIGHT; y ++) {
			cells[0][y] = F_WALL;
			cells[_FULLWIDTH - 1][y] = F_WALL;
		}
		function checkChange(_x, _y, _oldFlag, _newFlag) {
			if (cells[_x] && _oldFlag == cells[_x][_y]) {
				cells[_x][_y] = _newFlag;
				return true;
			}
			return false;
		}
		var interface = {
			getCenterCoord: function() {
				return {x: Math.round(node.width/2), y: Math.round(node.height/2)};
			}
			, oneCoordToCell: function(_coord) {
				return Math.floor(_coord/_cellSz);
			}
			, oneCellToCoord: function(_coord) {
				return _coord * _cellSz;
			}
			, setXy: function(_x, _y, _v) {
				cells[_x][_y] = _v;
				return this;
			}
			, getXy: function(_xy) {
				return cells[_xy.x][_xy.y];
			}
			, inField: function(_x, _y) {
				return _x >= 0 && _x < _FULLWIDTH && _y >= 0 && _y < _FULLHEIGHT;
			}
			, reshowAll: function() {
				node.width = node.width;	//очистка
				for (var x = 0; x < _FULLWIDTH; x ++) {
					for (var y = 0; y < _FULLHEIGHT; y ++) {
						this.reshowXy(x, y);
					}
				}
			}
			, reshowXy: function(_x, _y) {
				var cellType = cells[_x][_y]
					, lCoord = _x * _cellSz
					, tCoord = _y * _cellSz
					;
				switch (cellType) {
					case F_WALL: 
						ctx.clearRect(lCoord, tCoord,  _cellSz, _cellSz);
						break;
					case F_PROCESS:
						ctx.clearRect(lCoord, tCoord,  _cellSz, _cellSz);
						ctx.fillStyle = 'rgba(0, 0, 0, .5)';	
						ctx.fillRect(lCoord, tCoord,  _cellSz, _cellSz);
						break;
					case F_FREE:
						ctx.fillStyle = '#333333';	
						ctx.fillRect(lCoord, tCoord,  _cellSz, _cellSz);
						break;
				}
			}
			, getCellSize: function() {
				return _cellSz;
			}
			, getTotalGameCells: function() {
				return (_FULLWIDTH - 2) * (_FULLHEIGHT - 2);
			}
			/**
			 * Построение матрицы достижимости
			 * @param {Object} точка, от которой начинаем плясать
			 * @param {Array} - ранее заполненная матрица достижимости или тут создается
			 * @return {Array} заполненная для данной точки матрица
			 */
			, fillMatrixReachability: function(_xy, _matrix) {
				if (!_matrix) {	//Если не передали, то копируем cells
					_matrix = Array(cells.length);
					for (var i=0; i<cells.length; i++) {
						_matrix[i] = Array(cells[i].length);
						for (var j=0; j<cells[i].length; j++) {
							_matrix[i][j] = cells[i][j];
						}
					}
				}
				if (F_FREE != _matrix[_xy.x][_xy.y]) {
					return _matrix;
				}	
				
				//Вектор для направлений
				//Мы недолжны ходить по диагонали
				var vectors = [[-1, 0], [1, 0], [0, -1], [0, 1]]
					, vectorsSz = vectors.length;
				
				var stack = [];
				var curX = _xy.x
					, curY = _xy.y
					, curIdx = 0
					, nextX = 0
					, nextY = 0
					;
				_matrix[_xy.x][_xy.y] = F_MARKED;	
				while (true) {
					if (curIdx < vectorsSz) {
						//проверяем новую клетку
						nextX = curX + vectors[curIdx][0];
						nextY = curY + vectors[curIdx][1];
						curIdx ++;
						if (F_FREE != _matrix[nextX][nextY]) {
							continue;
						}
						//Переход на новую клетку
						_matrix[nextX][nextY] = F_MARKED;
						stack.push({cellX: curX, cellY: curY, vIdx: curIdx});
						curX = nextX;
						curY = nextY;
						curIdx = 0;
					} else {
						var item = stack.pop();
						if (!item) {
							break;
						}
						curX = item.cellX;
						curY = item.cellY
						curIdx = item.vIdx;
					}
				} 
				return _matrix;
			}
			, getNode: function() {
				return node;
			}
		};
		return interface;
	};
	
	/**
	 * @type {Function} - конструктор шариков
	 */
	var ballsConstruct = (function() {
		//Возможные векторы скорости
		var possibleSpeed = [[1,5], [1,4], [1,3], [2,5], [1,2], [3,5], [2,3], [3,4], [4,5], [1, 1], [5,1], [4,1], [3,1], [5,2], [2,1], [5,3], [3,2], [4,3], [5,4]]
			, possibleSpeedSz = possibleSpeed.length;
		//Занятые векторы скорости
		var buzySpeed = Array(possibleSpeedSz);
		//общее количество шаров
		var totalBalls = 0;
		
		return function(_x, _y, _velocity, _node) {
			if (totalBalls == possibleSpeedSz) {
				throw Error('Превышено возможное количество шаров ');
			}
			//случайным образом определяем вектор скорости
			var rnd = Math.floor(Math.random() * possibleSpeedSz);
			while (buzySpeed[rnd]) {
				rnd = (rnd + 1) % possibleSpeedSz;
			}
			totalBalls ++;
			buzySpeed[rnd] = 1;
			var speed = {x: possibleSpeed[rnd][0], y: possibleSpeed[rnd][1]};
			//случайным образом выбираем знак
			var speedSign = 
				{ x: (Math.random() < 0.5) ? 1 : -1
				, y: (Math.random() < 0.5) ? 1 : -1
				};
				
				
			var currentX, currentY,  node, errXY, koef;
			this.reinit = function(_x, _y, _velocity, _node) {
				currentX = _x; 
				currentY = _y;
				node = _node;
				//накопленная ошибка округления
				errXY = {x: 0, y: 0}; 
				//получаем коэффициент, на который будем умножать приращение, чтоб получить правильную скорость	
				//в заменателе корень из суммы квадратов катетов.
				//Уменьшаем скорость на -1 для того, чтоб при добавллении ошибки округления не выйти за границу
				koef = (_velocity) / Math.sqrt(Math.pow(speed.x, 2) + Math.pow(speed.y, 2));
			};
			this.reshow = function() {
				node.style.left = currentX + 'px';
				node.style.top = currentY + 'px';
			};
			this.getNode = function() {
				return node;
			};

			this.reinit(_x, _y, _velocity, _node);
			
			//Пока для тестирования, а там - посмотрим	
			function setSignVelocity(_x, _y) {
				speed.x = Math.abs(_x);
				speed.y = Math.abs(_y);
				speedSign.x = _x > 0 ? 1 : -1;
				speedSign.y = _y > 0 ? 1 : -1;
			}	
			function setCurrentPoint(_x, _y) {
				currentX = _x;
				currentY = _y;
			}
			function setErr(_x, _y) {
				errXY.x = _x; errXY.y = _y;
			}
			/**
			 * Вычисляет приращение для шага (полет)
			 * @returns {Object}
			 */
			this.calculateDxy = function() {
				var absFloatDx = speed.x * koef + errXY.x
					, absFloatDy = speed.y * koef + errXY.y
					, absDx = Math.floor(absFloatDx)
					, absDy = Math.floor(absFloatDy)
					;
				errXY.x = absFloatDx - absDx;	
				errXY.y = absFloatDy - absDy;
				return {x: absDx * speedSign.x, y: absDy * speedSign.y};
			};
			/**
			 * Установка перелета
			 * @param {Object} _xy
			 * @returns {undefined}
			 */
			this.setDxy = function(_xy) {
				currentX += _xy.x;
				currentY += _xy.y;
			};

			this.getCurrentPoint = function() {
				return {x: currentX, y: currentY};
			};
			this.getErr = function() {
				return errXY;
			};
			/**
			 * Устанавливаем следующую точку
			 * @param {Object} _xy
			 * @returns {undefined}
			 */
			this.setNextPoint = function(_xy) {
				currentX = _xy.x;
				currentY = _xy.y;
			};
			
			this.getVelocityVector = function() {
				return {x: speed.x * speedSign.x, y:  speed.y * speedSign.y};
			};
			
			this.changeVelocitySign = function(_coord) {
				speedSign[_coord] *= -1;
			}
		};
	})();
	/**
	 * Создает канву для шарика
	 * @param {DOM Object} _container
	 * @param {Integer} _radius
	 * @returns {DOM Object}
	 */
	function createBallNode(_container, _radius) {
		var d = _radius * 2;
		var node = resizeCanvas(createCanvas(_container, 'ball'), d, d)
			, ctx = node.getContext('2d');
		var radgrad = ctx.createRadialGradient
			( d / 3, d / 3, d / 6, _radius, _radius, _radius
				);
		radgrad.addColorStop(0, '#cccccc');
		radgrad.addColorStop(0.9, '#333333');
		radgrad.addColorStop(1, 'rgba(0,0,0,0)');	
		ctx.fillStyle = radgrad;
		ctx.fillRect(0, 0, d, d);
		return node;
	}
	/**
	 * Создает основной объект игры
	 * @param {String} _imgUrl
	 * @param {DOM Object} _container
	 * @param {Object} _params
	 * @param {Object} _callbacks - калбаки
	 * @returns {Object}
	 */
	function createFieldCanvas(_imgUrl, _container, _params, _callbacks) {
		//Если параметры Пропущенны -  ставим по-умолчанию
		var  minCellSz = 10
			, WIDTH = _params.w || 50
			, HEIGHT = _params.h || 30
			, TOTAL_LIVES = _params.lives || 5
			, PERCENT2WIN = _params.percentToWin || 67	//открыть надо не менее 2/3
			, ballsCnt = _params.balls || 5
			, velocityKoef = Math.min(1, Math.max(.1, _params.velocityKoef || 1))
			;
			
		//Объявляем переменные, небходимые в различных методах отдаваемого объекта
		var containerBox, cellSz, tabloNode, livesNode, pointersNode, fieldContainerNode, imgNode
			, fishka
			, field, TOTAL_GAME_CELLS, OPENED_CELLS
			, pauseFlag = false
			, stopFlag = false
			, livesCnt
			, RADIUS, ballsDiam, maxBallsVelocity
			;
			
		var balls = Array(ballsCnt), livesFishka = Array(TOTAL_LIVES);
	
		
		if (!_callbacks.onError) {
			_callbacks.onError = function onError(_str) {
				throw new Error(_str);
			};
		}

		/**
		 * После загрузки картинки устанавливает стили для нее
		 * @returns {undefined}
		 */
		function setImgStyle() {
			var imgMaxWidth = cellSz * (WIDTH-2)
				, imgMaxHeight = cellSz * (HEIGHT-2)
				, widthRelation = imgNode.width / imgMaxWidth
				, heightRelation = imgNode.height / imgMaxHeight
				;
			if (widthRelation > heightRelation) {
				imgNode.style.width = imgMaxWidth + 'px';
				//Как только установили ширину, высота автоматом поменялась на пропорциональную 
				//todo: а во всех ли браузерах?
				imgNode.style.top = cellSz + Math.floor((imgMaxHeight - imgNode.height)/2) + 'px';
				imgNode.style.left = cellSz + 'px';
			} else {
				imgNode.style.height = imgMaxHeight + 'px';
				imgNode.style.top = cellSz + 'px';
				imgNode.style.left =cellSz +  Math.floor((imgMaxWidth - imgNode.width)/2) + 'px';
				
			}	
		}
		/**
		 * Каллбак, вызывается для учета сгоревшей жизни, посте того, как фишка встала на место, а клетки в процессе сгорели
		 * @returns {undefined}
		 */
		function checkLoser() {
			//раскрашиваем жизнь в красный цвет. Или вообще можно скрыть
			livesCnt --;
			drawFishkaNode(livesFishka[livesCnt], ['#993333', '#330000']);
			if (0 == livesCnt) {
				stopFlag = true;
				_callbacks.onLoss ? _callbacks.onLoss() : (function() {
					if (confirm('YOU LOSER :( Again?')) {
						interface.rerun();
					}
				})();
			}
		}
		/**
		 * Каллбак, вызывается когда фишка достигла стенки
		 */
		function onConstructComplete() {
			//Cтроим матрицу достижимости от клеток с шарами.
			var matrix, openingCellsAr = [];
			var dCorner = [[0, 0], [0, ballsDiam], [ballsDiam, 0], [ballsDiam, ballsDiam]];
			for (var ballNumber=0; ballNumber<ballsCnt; ballNumber++) {
				var ltCorner = balls[ballNumber].getCurrentPoint();
				for (var i=0; i < dCorner.length; i++) {
					matrix = field.fillMatrixReachability(
						{ x: field.oneCoordToCell(ltCorner.x + dCorner[i][0])
						, y: field.oneCoordToCell(ltCorner.y + dCorner[i][1])
						}
						, matrix
						);
				}			
			}
			//В полученной матрице остались F_FREE те клетки, которые надо превратить в стену
			var maskCells = F_FREE | F_PROCESS;
			var nowOpeningCells = 0;
			for (var x=0; x<matrix.length; x ++) {
				for (var y=0; y<matrix[x].length; y++) {
					if (matrix[x][y] & maskCells) {
						nowOpeningCells ++;
						openingCellsAr.push([x, y]);
						field.setXy(x, y, F_WALL).reshowXy(x, y);
					}
				}
			}
			graduallyOpenCompletedCells(openingCellsAr);
		}
		/**
		 * Постепенное начисление очков (анимация)
		 * @param {Array} _openingCellsAr
		 * @returns {unresolved}
		 */
		function graduallyOpenCompletedCells(_openingCellsAr) {
			if (!_openingCellsAr.length) {
				return;
			}
			pauseFlag = true;
			var openingCellsCntByStep = Math.max(1, Math.floor(_openingCellsAr.length/20));	//количество клеток, открываемое за 1 шаг

			function step() {
				var i, el;
				for (i=0; i<openingCellsCntByStep; i++) {
					el = _openingCellsAr.pop();
					if (!el) {
						break;
					}
					OPENED_CELLS ++;
				}
				reshowPointers(OPENED_CELLS, TOTAL_GAME_CELLS);

				if (!_openingCellsAr.length) {
					if (OPENED_CELLS * 100 / TOTAL_GAME_CELLS > PERCENT2WIN) {
						animationHideFieldOnWin(function(){
							_callbacks.onWin ? _callbacks.onWin(calculatePointers(OPENED_CELLS)) : alert('YOU WIN!');	
						});
						stopFlag = true;
						pauseFlag = false;
						return;
					} else {
						setTimeout(revertPause, 100);
					}	
				} else {
					Site.newFrame(step);
				}
			};
			Site.newFrame(step);
		}
		/**
		 * Анимация при выигрыше - открываем полностью картинку
		 * @param {Function} _callback
		 * @returns {undefined}
		 */
		function animationHideFieldOnWin(_callback) {
			var opacity = 1, dOpacity = .02;
			function step() {
				opacity -= dOpacity;
				field.getNode().style.opacity = opacity;
				for (var ballNumber=0; ballNumber<ballsCnt; ballNumber++) {
					balls[ballNumber].getNode().style.opacity = opacity;
				}
				if (opacity > 0) {
					Site.newFrame(step);
				} else {
					_callback();
				}
			}
			step();
		}
		/**
		 * Раскрашивание переданного узла как фишки в переданные цвета
		 * @param {DOM object} _node
		 * @param {Array} _colors
		 * @returns {DOM object}
		 */
		function drawFishkaNode(_node, _colors) {
			var sz = _node.width
				, ctx = _node.getContext('2d')
				, radius = Math.round(sz/2)
				;
			_node.width = sz;
	
			var radgrad = ctx.createRadialGradient(sz / 3, sz / 3, sz / 6, radius, radius, radius);
			radgrad.addColorStop(0, _colors[0]);
			radgrad.addColorStop(0.9, _colors[1]);
			radgrad.addColorStop(1, 'rgba(0,0,0,0)');	
			ctx.fillStyle = radgrad;
			ctx.fillRect(0, 0, sz, sz);
			return _node;
		}
		/**
		 * Показ количества набранных очков на табло
		 * @param {Integer} _opened
		 * @param {Integer} _total
		 * @returns {undefined}
		 */
		function reshowPointers(_opened, _total) {
			pointersNode.innerHTML = calculatePointers(_opened);
		}
		function calculatePointers(_openedCells) {
			return _openedCells * ballsCnt;
		}
		function revertPause() {
			pauseFlag = !pauseFlag;
		}
		
		function coordToCell(_xy) {
			return {x: field.oneCoordToCell(_xy.x), y: field.oneCoordToCell(_xy.y)};
		}
		function cellToCoord(_xy) {
			return {x: field.oneCellToCoord(_xy.x), y: field.oneCellToCoord(_xy.y)};
		}


		/**
		 * Основная функция полета шариков
		 * Вызывается в цикле
		 * @returns {undefined}
		 */
		function oneStep() {
			if (pauseFlag) {
				return true;	
			}
			if (stopFlag) {
				return false;
			}
			
			fishka.onStep();
			var fishkaXYR = fishka.getPositionProperty()
				, squareOfRadius = Math.pow(RADIUS + fishkaXYR.r, 2)
				;
			//вспомогательный массив для проведения однотипных операций над обееми координатами
			var dxyKeyNames = ['x', 'y'];	
						
			for (var ballNumber=0; ballNumber<ballsCnt; ballNumber++) {
				var currentBall = balls[ballNumber];
				var dxy = currentBall.calculateDxy();
				var currentPointBegin = currentBall.getCurrentPoint();
			
				// Вычисление и отдача координат углов контейнера шара. 
				// Посмотрим, не задевает ли он клетку в состоянии процесса
				var dCorner = [[0, 0], [0, ballsDiam], [ballsDiam, 0], [ballsDiam, ballsDiam]];
				for (var i=0; i < dCorner.length; i++) {
					var cellXy = 
						{ x: field.oneCoordToCell(currentPointBegin.x + dCorner[i][0])
						, y: field.oneCoordToCell(currentPointBegin.y + dCorner[i][1])
						};
					var cellVal = field.getXy(cellXy);
					if (F_PROCESS == cellVal) {
						//важно изменить fishkaXYR, что б дальнейший код пользовался актуальным
						fishkaXYR = fishka.onHit();
					}
				}

				//Посмотрим, не попал ли шар в фишку (если фишка не полностью на клетке, то она не метиться как F_PROCESS
				var centerX = currentPointBegin.x + RADIUS
					, centerY = currentPointBegin.y + RADIUS
					, squareOfDistantion = Math.pow(centerX - fishkaXYR.x, 2) + Math.pow(centerY - fishkaXYR.y, 2)
					;
				//ВАЖНО, чтоб фишка не была в это время на стене!
				if (fishkaXYR.currentCellType != F_WALL &&  squareOfDistantion < squareOfRadius) {
					fishkaXYR = fishka.onHit();
				}



				do {
					var curPoint = currentBall.getCurrentPoint()
						, checkPoints = []
						;

					var hitInCorner = false;

					//Определяем, куда движимся. Далее берем середины "передних" сторон - точки для проверки
					//Даже если двигались параллельно, нужно взять чекпоинты "параллельных граней"
					//, т.к. они могут войти в занятую клетку. Для простоты будем брать все чекпоинты
					var centerX = curPoint.x + RADIUS
						, centerY = curPoint.y + RADIUS
						, tmpAr = [[-RADIUS, 0], [RADIUS, 0], [0, -RADIUS], [0, RADIUS]]	//прирашения
						;
					for (var i=0; i < tmpAr.length; i++) {
						checkPoints.push({x: centerX + tmpAr[i][0], y: centerY + tmpAr[i][1]});
					}		

					//Для каждой из точек проверки получаем координаты клетки. 
					//Далее получаем координаты клетки предполагаемого положения этой точке после завершения шага. 
					//Смотрим, куда попали. Если есть столкновение, то по каждой из координат проверяем, была ли изменена клетка
					var shocks = {x: [], y: []};	//храним точки, которые точно столкнулись (чтоб проверть, кто первый)
					var notFreeNextPoint = 0;
					for (var i=0; i<checkPoints.length; i++) {
						var curChp = checkPoints[i]
							, nextCell = {x: field.oneCoordToCell(curChp.x + dxy.x), y: field.oneCoordToCell(curChp.y + dxy.y)}
							;
							
						var cellType = field.getXy(nextCell);
						var curCellForChp =  {x: field.oneCoordToCell(curChp.x), y: field.oneCoordToCell(curChp.y)};
						
						if (F_FREE == cellType || F_FISHKA == cellType ) {	
							//попали на свободную клетку, далее точку не рассматриваем. 
							//Используем то, что скорость не может быть больше половины клетки и закрываем глаза на мелкие ошибки :)
							continue;	
						}
						if (F_PROCESS == cellType) {
							fishka.onHit();	//It's not true
							continue;
						}
						
						notFreeNextPoint ++;
						//если других типов не появится, попали в стену
						//проверим, по какой координате надо проверять столкновение. 
						//При этом проверяем, свободна ли у стены рассматриваемая грань или там тоже стена
						//ВАЖНО! если меняется координата клетки Х, то столкновение по гране У!						
						for (var j=0; j< dxyKeyNames.length; j++) {
							var dxyKey = dxyKeyNames[j]	//название координаты, которая меняется
								, dCoord = curCellForChp[dxyKey] - nextCell[dxyKey]
								;
							var nameOxy = dxyKey == 'x' ? 'y' : 'x';	//название координаты грани, о которую бъемся
							
							//если координата менялась, надо проверить, свободно ли соответствующее ребро у стены
							//из-за ограничения по скорости рассматриваем только ближайшие клетки
							//@todo: надо рассмотреть случай, когда клетка рядом = F_PROCESS - подумать
							//надо изменить НЕ текущую координату и проверить...
							//Надо проверять не координату текущей клетки, а координату следующей +-1, тогда нет проблемы с границей
							//Нюанс: чекпоинт все же должен находиться на границе, если координата клетки не менялась
							
							var neighborXy = {};
							neighborXy[nameOxy] = nextCell[nameOxy];	//проверяемая координата остается не тронутой

							if (!dCoord) {
								//Координата клетки не менялась
								if (curChp[dxyKey] == field.oneCellToCoord(nextCell[dxyKey]) && dxy[dxyKey]) { 
									//чекпоинт лежит на границе со следующей клеткой, и следующая клетка не = текущей и есть приращение по координате
									//то столкновение надо проверять (но надо постараться избавиться от проверки на 0 здесь)
									var dDxyKeyCell = dxy[dxyKey] > 0 ? -1 : 1;
									neighborXy[dxyKey] = nextCell[dxyKey] + dDxyKeyCell;
								} else {
									continue;
								}
							} else {
								//Если координата менялась, то смело берем за соседку координату текущей клетки чекпоинта
								neighborXy[dxyKey] = curCellForChp[dxyKey];
							}	
							//Смотрим на соседа только  если менялась координата клетки. Иначе у нас касание
							//ЗДЕСЬ может вылезти за границу! если dxy[dxyKey]==0
							if (F_WALL == field.getXy(neighborXy)) {
								//грань закрыта, от нее не могло отскочить
								continue;
							}
							shocks[nameOxy].push({'checkpoint': curChp, 'hitcell': nextCell});
						}	
					}

					var canChangeBall = true;	//флаг того, что можно менять шарик
					
					//---	
					//Проверим, были ли столкновения
					if (!shocks.x.length && !shocks.y.length) {
						//никаких столкновений, просто приращяем координату
						currentBall.setDxy(dxy);
					} else {
						if (shocks.x.length && shocks.y.length) {
							//если все же обрабатывать правильно, то  надо будет убрать ненужную координату (точнее обнулить ее массив)
							//выбрать, с кем столкнется первой.
							//должно будет остаться приращение и на следующей итерации столкнется со второй

							//Решаем следующее: можем найти приращение по одной из координат, 
							//но это - угол и у разных стен будут разные координаты
							//Надо привести к единой координате  

							//здесь выбираем по каждой из координат точки, которые столкнуться первыми
							var theBestByCoords = {};
							var dCoordByCoord = {};
							//если столкновение происходит по оси OX, то шар подлетает сверху или снизу, 
							//т.е. надо смотреть, сколько лететь не по ОХ, а по ОУ и уже потом вычислять ОХ							
							for (var j=0; j< dxyKeyNames.length; j++) {
								var dxyKey = dxyKeyNames[j];
								var otherDxyKey = dxyKey == 'x' ? 'y' : 'x';
								
								//Кто ближе 
								var nearly = Infinity;
								for (var k=0; k<shocks[dxyKey].length; k ++) {
									var item = shocks[dxyKey][k]
										, dCoord = field.oneCellToCoord(item.hitcell[otherDxyKey]) - item.checkpoint[otherDxyKey]
										;
									//здесь важно прибавить размер клетки у того, кто движется снизу или слева
									if (dxy[otherDxyKey] < 0) {
										dCoord += cellSz;	//Знак + из-за того, что вектор скорости отрицателен и конечная точка меньше начальной
									}	
									
									var absD = Math.abs(dCoord);
									if (nearly > absD) {
										nearly = absD;
										theBestByCoords[dxyKey] = item;
										dCoordByCoord[dxyKey] = dCoord;
									}
								}
							}	
							//теперь из выбранных сравниваем, кто стукнется быстрее, к примеру по OX
							//ПОМНИМ! что удар в theBestDxFromX приходится по Y
							//ddxy.x / dxy.x = ddxy.y / dxy.y   =>   ddxy.y =  ddxy.x * dxy.y / dxy.x
							var theBestDxFromX = Math.abs(Math.round(dCoordByCoord.x * dxy.x / dxy.y))
								, theBestDxFromY = Math.abs(dCoordByCoord.y); 
								
							if (theBestDxFromX == theBestDxFromY) {
								//Нам все равно, с какой точкой работать. Т.о. можно убрать все точки, кроме одной. 
								//А по другой координате сделать реверс скорости и поменять приращение
								//с Y работать не будем...
								//но надо ревертнуть скорость подготовить приращение
								
								//Выберем точку по размеру dxy? Было choicedCoord = x
								var choicedCoord = Math.abs(dxy.x) < Math.abs(dxy.y) ? 'x' : 'y';
								var otherCoord = 'x' == choicedCoord ? 'y' : 'x';

								shocks[otherCoord] = [];	
								//потом по этому флагу ревертнем скорость и приращение
								hitInCorner = true;
								
								shocks[choicedCoord] = [theBestByCoords[choicedCoord]];	
							} else if (theBestDxFromX < theBestDxFromY) {
								shocks.y = [];	//обнулили и провалились дальше
							} else {
								shocks.x = [];	//обнулили и провалились дальше
							}	
						} 
						
						for (var j=0; j< dxyKeyNames.length; j++) {
							var dxyKey = dxyKeyNames[j];
							var otherDxyKey = dxyKey == 'x' ? 'y' : 'x';
							
							if (!shocks[dxyKey].length) {
								continue;
							}
							//Кто ближе к x, того и отскок
							var nearly = Infinity, choisedItem;
							for (var k=0; k<shocks[dxyKey].length; k ++) {
								var item = shocks[dxyKey][k]
									, absD = Math.abs(item.checkpoint[otherDxyKey] - field.oneCellToCoord(item.hitcell[otherDxyKey]))
									;
								if (nearly > absD) {
									nearly = absD;
									choisedItem = item;
								}
							}
							var coordHitCell = field.oneCellToCoord(choisedItem.hitcell[otherDxyKey]);
							//если двигаемся обратно, то отскок будет от правой или нижней грани, 
							//т.о надо прибавить размер клетки
							if (dxy[otherDxyKey] < 0) {
								coordHitCell += cellSz;
							}
							//приращение до точки столкновения
							//одну координату знаем, другую вычисляем по пропорции
							//ddxy.x / dxy.x = ddxy.y / dxy.y		=>		ddxy.y =  ddxy.x * dxy.y / dxy.x
							//и наоборот
							var ddxy = {};
							//здесь определяем, чколько надо пролететь шарику до удара о стену
							ddxy[otherDxyKey] =  coordHitCell - choisedItem.checkpoint[otherDxyKey];
							if (0 == ddxy[otherDxyKey]) {
								//чекпоинт лежит прямо на границе клетки - прибавим (или отнимем) 1
								//Остаемся на месте, но приращение уменьшаем
								dxy[otherDxyKey] = dxy[otherDxyKey] + (dxy[otherDxyKey]>0 ? -1 : 1);
								//Сделаем хак: если приращение стало нулевым, то по другой координате подвинем на +- единицу, 
								//дабы избежать зацикливания. Но есть проблема, может зацикливание на +-1
								if (!dxy[otherDxyKey] && dxy[dxyKey]) {
									var forceDxy = {x: 0, y: 0};
									forceDxy[dxyKey] = dxy[dxyKey] / Math.abs(dxy[dxyKey]);
									currentBall.setDxy(forceDxy);
								}
							}
							ddxy[dxyKey] = dxy[otherDxyKey] ? Math.round(ddxy[otherDxyKey] * dxy[dxyKey] / dxy[otherDxyKey]) : 0;
							//т.к. работаем с приращениями, не паримся о точке (прибавляем приращение к
							//левому верхнему углу
							currentBall.setDxy(ddxy);
							dxy.x -= ddxy.x;	//Здесь бывает, что обнуляется ddxy.x
							dxy.y -= ddxy.y;
							//Меняем знак у скорости и оставшегося приращения по координате
							currentBall.changeVelocitySign(otherDxyKey);
							dxy[otherDxyKey] *= -1;	
							if (hitInCorner) {
								currentBall.changeVelocitySign(dxyKey);
								dxy[dxyKey] *= -1;	
							}
							if (dxy.x && dxy.y) { //if (dxy[otherDxyKey]) {
								canChangeBall = false;	//еще покувыркаемся
							}
						}
					}	
				} while (!canChangeBall);	//Конец итераций по шарику на одном шаге
				//Рисуем шарик
				currentBall.reshow();
			}
			return true;
		}
		//---
		
		function begin() {
				_container.innerHTML = '';
				//---
				//Смотрим на контейнер, размещаем в нем табло и поле
				//Для табло возьмем двойную высоту клетки
				containerBox = _container.getBoundingClientRect();
				cellSz = Math.min(Math.floor(containerBox.width / WIDTH), Math.floor(containerBox.height / (HEIGHT + 2)));
				if (cellSz < minCellSz) {
					_callbacks.onError('Переданные параметры не позволяют разместить игру в контейнере. Размер клетки ' + 
						cellSz + ' получается меньше допустимого ' + minCellSz);
					return;		
				}
				RADIUS = Math.floor(cellSz/2)-1;
				ballsDiam = RADIUS * 2;
				maxBallsVelocity = Math.max(3, Math.round(RADIUS * velocityKoef));
				tabloNode = _container.appendChild(createNode('div', 'tablo',
					{ width: cellSz * WIDTH + 'px'
					, height: 2 * cellSz + 'px'
					, paddingTop: Math.floor(cellSz/2) + 'px'
					//, paddingBottom: Math.floor(cellSz/2) + 'px'
					, fontSize: cellSz + 'px'
					}));
				livesNode = tabloNode.appendChild(createNode('div', 'lives', {width: cellSz * TOTAL_LIVES + 'px', marginLeft: cellSz + 'px'}));
				pointersNode = tabloNode.appendChild(createNode('div', 'pointers', {marginRight: cellSz + 'px'}));
				fieldContainerNode = _container.appendChild(createNode('div', 'fieldContainer', {width: cellSz * WIDTH + 'px', height: cellSz * HEIGHT + 'px'}));

				imgNode = new Image;
				fieldContainerNode.appendChild(imgNode);
				imgNode.style.position = 'absolute';
				imgNode.addEventListener('load', function () {
					if (_callbacks.successLoad) {
							_callbacks.successLoad();
					}
					if (imgNode.width < 100 || imgNode.height < 100) {
						return _callbacks.onError('Картинка должна быть не менее 100px по меньшей стороне. Возможно ошибка загрузки.');
					}			
					setImgStyle();
				});
				imgNode.src = _imgUrl;

				field = createField(fieldContainerNode, cellSz, WIDTH, HEIGHT);
				TOTAL_GAME_CELLS = field.getTotalGameCells();	//Общее количество клеток, которое нужно открыть
				OPENED_CELLS = 0;	//Количество уже открытых клеток
				reshowPointers(OPENED_CELLS, TOTAL_GAME_CELLS);

				for (var i=0; i<TOTAL_LIVES; i++) {
					livesFishka[i] = drawFishkaNode( 
						resizeCanvas(createCanvas(livesNode, 'fishka'), cellSz, cellSz)
						, ['#ccffcc', '#33aa33']
						);		
				}
				livesCnt = TOTAL_LIVES;

				var fishkaNode = drawFishkaNode(
					resizeCanvas(createCanvas(fieldContainerNode, 'fishka'), cellSz, cellSz)
					, ['#ccccff', '#3333aa']
				);
				fishka = createFishka(fishkaNode, fieldContainerNode, field, 
					{ onConstructComplete: onConstructComplete
					, checkLoser: checkLoser
					});

				//Создаем массив шариков
				var center = field.getCenterCoord();
				for (var i=0; i<ballsCnt; i++) {
					if (balls[i]) {
						balls[i].reinit(Math.round(center.x)
							, Math.round(center.y)
							, maxBallsVelocity
							, createBallNode(fieldContainerNode, RADIUS)
						);
					} else {
						balls[i] =  new ballsConstruct
							(Math.round(center.x)
							, Math.round(center.y)
							, maxBallsVelocity
							, createBallNode(fieldContainerNode, RADIUS)
							);
					}			
				}
				stopFlag = false;
				field.reshowAll();
				runSteps();
				//---
		}

		function runSteps() {
			if (oneStep()) {
				Site.newFrame(runSteps);
			} else {
				fishka.onStop();
			}	
		}
			
		var timeoutRes;
		/**
		 * Интерфейс взаимодействия со всем хозяйством
		 * @type {Object}
		 */
		var interface = {
			 run: function() {
				stopFlag = true;
				begin();
			}
			, rerun: function() {
				//В даном случае необходимо сделать паузу, т.к. вызывается при изменении размеров окна 
				//и может прийти оч. много событий - обрабатываем последнее
				stopFlag = true;
				fishka.onStop();
				if (timeoutRes) {
					clearTimeout(timeoutRes);
				}
				timeoutRes = setTimeout(begin, 100);
			}
		};
		return interface;
	}
	/**
	 * Возвращает интерфейс взаимодействия с фишкой
	 * @returns {Object}
	 */
	var createFishka = function(_fishkaNode, _fieldContainer, _field, _callbacks) {
		var MOVE_STOP = 0, MOVE_LEFT = 37, MOVE_RIGHT = 39, MOVE_UP = 38, MOVE_DOWN=40;
		var currentMove = MOVE_STOP
			, cellSz = _field.getCellSize()
			, velocity = Math.round(cellSz / 3)
			, processCells = []	//сюда будем класть строящиеся клетки
			, radius = Math.round(cellSz / 2);
			;

		var holdCell = false;	//при работе с тач-интерфейсом запоминаем позицию (клетки)
		
		var currentCell = {x: 0, y: 0}; // Клетка, в которой находится часть фишки по направлению движения либо вся фишка
		var ltCoordX = 0, ltCoordY = 0;	//где находится левый верхний угол фишки
		var lastPositionInWall = {x: 0, y: 0};
		var moveVector = {
			37: {x: -1, y: 0}	//left
			, 38: {x: 0, y: -1}	//up
			, 39: {x: 1, y: 0}	//right
			, 40: {x: 0, y: 1}	//down
		};
		
		
		function showFishka() {
			_fishkaNode.style.left = ltCoordX + 'px';
			_fishkaNode.style.top = ltCoordY + 'px';
		}
		
		function toBeginOfCurrentCell() {
			ltCoordX = currentCell.x * cellSz;
			ltCoordY = currentCell.y * cellSz;
		}
		
		function setMoveStop() {
			toBeginOfCurrentCell();
			currentMove = MOVE_STOP;
		}
		
		function getLeadingCoord(_x, _y, _move) {
			if (!moveVector[_move]) {
				return {x: _x, y: _y};
			}
			var v = moveVector[_move];
			return {x: (_x + (v.x > 0 ? cellSz : 0)), y: (_y + (v.y > 0 ? cellSz : 0))};
		}
		
		function changeDirection(_newMove) {
			if (currentMove == _newMove) {
				return false;
			}
			if (MOVE_STOP == _newMove) {
				setMoveStop();
			} else {
				toBeginOfCurrentCell();
			}	
			currentMove = _newMove;
			return true;
		}
		
		var handlers = {
			keyDown: function(_e) {
				if (moveVector[_e.keyCode]) {
					changeDirection(_e.keyCode);
				}
			}
			, keyUp: function() {
				if (F_WALL == _field.getXy(currentCell)) { //останавливаемся только если находимся на стене
					setMoveStop();
				}	
			}
			, mouseDown: function(_e) {
				setHoldCellFromFieldContainerTouch(_e.pageX, _e.pageY);
				tryChangeCurrentMoveFromHoldCell();
				_e.preventDefault();
				return false;
			}
			, mouseUp: function(_e) {
				holdCell = false;
				if (F_WALL == _field.getXy(currentCell)) { 
					//останавливаемся только если находимся на стене
					setMoveStop();
				}	
				_e.preventDefault();
				return false;
			}
			, mouseMove: function(_e) {
				if (1 & _e.buttons) {
					setHoldCellFromFieldContainerTouch(_e.pageX, _e.pageY);
					if (MOVE_STOP == currentMove) {
						tryChangeCurrentMoveFromHoldCell();
					}
				}	
				_e.preventDefault();
				return false;
			}
			,  touchStart: function(_e) {
				setHoldCellFromFieldContainerTouch(_e.touches[0].pageX, _e.touches[0].pageY);
				tryChangeCurrentMoveFromHoldCell();
				_e.preventDefault();
				return false;
			}
			, touchMove: function(_e) {
				setHoldCellFromFieldContainerTouch(_e.touches[0].pageX, _e.touches[0].pageY);
				if (MOVE_STOP == currentMove) {
					tryChangeCurrentMoveFromHoldCell();
				}
				_e.preventDefault();
				return false;
			}
		}
		
		/**
		 * Устанавливает обработчики на события
		 * @returns {undefined}
		 */
		function setHandlers() {
			document.addEventListener('keydown', handlers.keyDown);
			document.addEventListener('keyup', handlers.keyUp);
			if (!!('ontouchstart' in window)) {	//touch screen
				_fieldContainer.addEventListener('touchstart', handlers.touchStart);		
				_fieldContainer.addEventListener('touchmove', handlers.touchMove);
				_fieldContainer.addEventListener('touchend', handlers.mouseUp);		
			} else {
				_fieldContainer.addEventListener('mousedown', handlers.mouseDown);
				_fieldContainer.addEventListener('mouseup',  handlers.mouseUp);
				_fieldContainer.addEventListener('mousemove',handlers.mouseMove);		
				_fieldContainer.addEventListener('mouseleave',  handlers.mouseUp);
			}	
		}	

		function removeHandlers() {
			document.removeEventListener('keydown', handlers.keyDown);
			document.removeEventListener('keyup', handlers.keyUp);
			if (!!('ontouchstart' in window)) {	//touch screen
				_fieldContainer.removeEventListener('touchstart', handlers.touchStart);		
				_fieldContainer.removeEventListener('touchmove', handlers.touchMove);
				_fieldContainer.removeEventListener('touchend', handlers.mouseUp);		
			} else {
				_fieldContainer.removeEventListener('mousedown', handlers.mouseDown);
				_fieldContainer.removeEventListener('mouseup',  handlers.mouseUp);
				_fieldContainer.removeEventListener('mousemove',handlers.mouseMove);		
				_fieldContainer.removeEventListener('mouseleave',  handlers.mouseUp);
			}	
		}	
		
		 setHandlers();

		/**
		 * Для мыши и тач-интерфейса
		 * Определяем, в какую сторону необходимо двигаться исходя из расположения holdCell
		 * @returns {Number}
		 */
		function determineDirectionByHoldCell() {
			var dx = holdCell.x - currentCell.x
				, dy = holdCell.y - currentCell.y
				;
			if (!dx && !dy) {
				return MOVE_STOP;
			}	
			//надо понять, в какую сторону ПРЕДПОЛОЖИТЕЛЬНО будем двигаться
			if (Math.abs(dx) > Math.abs(dy)) {
				return dx >0 ? MOVE_RIGHT : MOVE_LEFT;
			} else {
				return dy >0 ? MOVE_DOWN : MOVE_UP;
			}
		}
		
		function setHoldCellFromFieldContainerTouch(_x, _y) {
			var containerBox = _fieldContainer.getBoundingClientRect();
			holdCell = 
				{ x: _field.oneCoordToCell(_x - containerBox.left)
				, y: _field.oneCoordToCell(_y - containerBox.top)
				};
		}
		
		/**
		 * Для мыши и тач-интерфейса
		 * Реакция на событие перетаскивания указателя мыши или пальца
		 * @param {Integer} _x
		 * @param {Integer} _y
		 * @returns {Boolean} - Было ли изменено направление движения
		 */
		function tryChangeCurrentMoveFromHoldCell() {
			var currentDirection
				, otherDirection
				, newMove = determineDirectionByHoldCell()
				;

			//Если текущее направление движения не в 
			//противоположную сторону - продолжаем двигаться
			if (MOVE_STOP != currentMove) {
				if (MOVE_STOP == newMove) {
					return changeDirection(newMove);
				}
				currentDirection = moveVector[currentMove].x ? 'x' : 'y';
				otherDirection = moveVector[currentMove].x ? 'y' : 'x';
				//количество шагов до достижения точки нажатия фишкой по оси, 
				//по которой сейчас движимся. Здесь важен знак, если положительный, 
				//то эту координату достигнем когда-нить
				var steps = (holdCell[currentDirection] - currentCell[currentDirection]) / moveVector[currentMove][currentDirection];
				if (steps > 0) {
					return false;	//Продолжаем двигаться, пока не достигнем нужной координаты
				} else {	
					//сдвинули таким образом, что координату никогда не достигнем или уже на ней, 
					//надо менять направление движения. Но тут будем выбирать, на какое.
					//не рассматриваем случай, когда мышь над фишкой, т.к. он рассмотрен в determineDirectionByHoldCell
					return changeDirection(newMove);
				}
			} else {
				return changeDirection(newMove);
			}
		}
		
		/**
		 * Вызывается, когда текущая клетка либо меняется либо находимся полностью в ней 
		 * @return {Boolean} разрешение, можно ли менять клетку в дальнейшем 
		 */
		function stayInCurrentCell() {
			var curX = currentCell.x, curY = currentCell.y;
			switch (_field.getXy(currentCell)) {
				case F_FISHKA:
					//если было F_FISHKA, то меняем на F_PROCESS и кладем в стек
					_field.setXy(curX, curY, F_PROCESS)
						.reshowXy(curX, curY);
					processCells.push({x: curX, y: curY});
					break;
				case F_WALL:
					lastPositionInWall.x = curX;
					lastPositionInWall.y = curY;
					//Надо поискать по клеткам и переделать все F_PROCESS в F_WALL
					if (processCells.length) {
						if (_callbacks.onConstructComplete) {
							_callbacks.onConstructComplete();
						} 	
						processCells = [];
						currentMove = MOVE_STOP;
						return false;	//мы остановились, необходимо позиционироваться на начале клетки
					}
					break;
				case F_PROCESS:	//пошли назад ? ну ладно...
					break;
			}
			return true;
		}

		return {
			onStep: function() {
				if (currentMove == MOVE_STOP) {
					//тут надо смотреть где стоим, если на стене, то возможно есть processCells
					stayInCurrentCell();
					showFishka();
					return;
				}
				var coordX = ltCoordX + velocity * moveVector[currentMove].x
					, coordY = ltCoordY + velocity * moveVector[currentMove].y
					, leadingCoord = getLeadingCoord(coordX, coordY, currentMove)
					, nextCellX = _field.oneCoordToCell(leadingCoord.x)
					, nextCellY = _field.oneCoordToCell(leadingCoord.y)
					;
				if (!_field.inField(nextCellX, nextCellY)) {
					//выход за границы
					if (holdCell) {
						tryChangeCurrentMoveFromHoldCell();
					} else {
						setMoveStop();
						stayInCurrentCell();
					}	
					showFishka();
					return;
				}
				
				if (nextCellX != currentCell.x || nextCellY != currentCell.y) {
					if (!stayInCurrentCell()) {
						//надо позиционироваться на начале
						toBeginOfCurrentCell();
						showFishka();
						return;
					}
					
					if (holdCell) {
						//Если работали с мышью или тач-интерфейсом
						if (tryChangeCurrentMoveFromHoldCell()) {
							showFishka();
							return;
						} 
					}	
					
					currentCell.x = nextCellX;
					currentCell.y = nextCellY;
					
					if (F_FREE == _field.getXy(currentCell)) {
						_field.setXy(nextCellX, nextCellY, F_FISHKA);
					}
				}
				ltCoordX = coordX;
				ltCoordY = coordY;
				showFishka();
				return;
			}
			
			, onHit: function() {
				//попали в строящуюся клетку - надо убирать все строящиеся и уменьшать жизни (?)
				//и двигать фишку назад
				processCells.forEach(function(_el){
					_field.setXy(_el.x, _el.y, F_FREE).reshowXy(_el.x, _el.y);
				});
				processCells = [];
				if (F_FISHKA == _field.getXy(currentCell)) {
					_field.setXy(currentCell.x, currentCell.y, F_FREE);
				}
				currentMove = MOVE_STOP;
				currentCell.x = lastPositionInWall.x;
				currentCell.y = lastPositionInWall.y;
				holdCell = false;
				toBeginOfCurrentCell();
				showFishka();
				_callbacks.checkLoser();
				
				return this.getPositionProperty();
			}
			, onStop: function() {
				removeHandlers();
			}
			, getPositionProperty: function() {
				return {x: ltCoordX + radius, y: ltCoordY + radius, r: radius, currentCellType: _field.getXy(currentCell)};
			}
		};
	};
	
	
	var GAME;
	return {
		run: function(_imgUrl, _container, _params, _callbacks){
			
			GAME = createFieldCanvas(_imgUrl, _container, _params, _callbacks || {});

			if (!_container.className) {
				_container.className = 'ballContainer';
			} else {
				_container.className += ' ballContainer';
			}
			
			GAME.run();
			
			return;
		}
		, redraw: function() {
			GAME.rerun();
		}
	};
})();
