/* 
 * Найди пару
 * @author: Samoylov Vasily
 * devphuzzle@gmail.com
 */
var findPair = (function(){
	
	var PI = Math.PI
		, HALF_PI = PI/2
		, DA = PI/15	//приращение при анимации
		;
	
	/**
	 * отвечает за "низкий уровень" игры
	 */
	var gameCore = (function(){
		var mixedPairs;	//Перемешанный массив с парами
		var found;		//Найденные элемены
		var selected = [];	//открытые на текущем шаге
		var steps = 0;		//количество шагов (открытий)
		var obj = {
			/**
			 * Создает mixedPairs и наполняет его случайным образом от 0 до _n-1 парами
			 * @param {Integer} _n
			 * @returns {undefined}
			 */
			init: function(_n) {
				var sz = _n * 2, rnd, i, j;
				mixedPairs = Array(sz);
				steps = 0;
				found = Array(_n);
				for (i=0; i<_n; i++) {
					for (j=0; j<2; j++) {
						rnd = Math.floor(Math.random() * sz);
						while ('undefined' != typeof(mixedPairs[rnd])) {
							rnd = (rnd+1)%sz;
						}
						mixedPairs[rnd] = i;
					}	
				}
			}
			/**
			 * Возвращает содержимое "карточки" по ее индексу
			 * одновременно кладет содержимое в массив отмеченных
			 * @param {type} _id
			 * @returns {unresolved}
			 */
			, getById: function(_id) {
				var val = mixedPairs[_id];
				if (found[val]) {
					return -1;	//эта карточка уже открыта
				}
				if (-1 != selected.indexOf(_id)) {
					return -1;	//повторное открытие
				}
				selected.push(_id);
				steps ++;
				return val;
			}
			/**
			 * Была ли открыта пара (не обязательно одинаковые)
			 * @returns {Booleathis, _e, parseInt(this.getAttribute('idx')), foundn}
			 */
			, pairOpened: function() {
				return selected.length >= 2;
			}
			/**
			 * Была ли найдена пара
			 * @returns {Array}	
			 */
			, getClosingPair: function() {
				var ret = false;
				if (mixedPairs[selected[0]] == mixedPairs[selected[1]]) {
					//нашли пару
					found[mixedPairs[selected[0]]] = true;
				} else {
					ret = [];
					for (var i=0; i<selected.length; i++) {
						ret.push([selected[i], mixedPairs[selected[i]]]);
					}
				}
				selected = [];
				return ret;
			}
			/**
			 * Получаем массив элементов 
			 * @returns {Array}
			 */
			, getMixedPairs: function() {
				return mixedPairs;
			}
			/**
			 * Проверяем выигрыш
			 * @returns {Integer}
			 */
			, checkWin: function() {
				for (var i=0; i<found.length; i++) {
					if (!found[i]) {
						return false;
					}
				}
				return steps;
			}
		};
		return obj;
	})();
	
	/**
	 * Отвечает за анимацию. Использует каллбак для прорисовки
	 */
	var animator = (function(){
		var angle, da, angelBorder, callbacks;
		
		function animate() {
			var stopFlag = false;
			angle += da;
			if (Math.abs(angle - angelBorder) < Math.abs(da)) {
				angle = angelBorder;
				stopFlag = true;
			}
			callbacks.show(angle);
			if (!stopFlag) {
				App.newFrame(animate);
				return;
			} 
			callbacks.stop();
		}
		
		return {
			close: function(_callbacks) {
				callbacks = _callbacks;
				angle = PI;
				da = -DA;
				angelBorder = 0;
				animate();
			}
			, open: function(_callbacks) {
				callbacks = _callbacks;
				angle = 0;
				da = DA;
				angelBorder = PI;
				animate();
			}
		};
	})();
	
	/**
	 * Отвечает за загрузку картинки и заполнение канв
	 * @type Object
	 */
	var imagePreparator = (function(){
		var img;
		var canvasCnt;	//Количество кусков, на которое будем резать картинку, и из этих кусков создавать канвы
		var imgCut = {rows: 0, cols: 0};	//Как резать картинку (вычисляем)
		var canvases = [];
		
		function resize(_elem, _x, _y) {
			_elem.width = _x;
			_elem.style.width = _x + 'px';
			_elem.height = _y;
			_elem.style.height = _y + 'px';
			return _elem;
		}
		/**
		 * Вызывается по событию загрузки картинки.
		 * производит вычисления, как ее разрезать и как заполнять канвы
		 * Возвращает метод-заполнитель канв
		 * @param {Integer} _chunkW - ширина канвы
		 * @param {Integer} _chunkH - высота канвы
		 * @returns {findPair._L5.imagePreparator._L104.onLoad.Anonym$0|@exp;_cb@call;onError}
		 */
		function onLoad(_chunkW, _chunkH) {
			if (img.width < 100 || img.height < 100) {
				return _cb.onError('Картинка должна быть не менее 100px по меньшей стороне. Возможно ошибка загрузки.');
			}
			
			//Есть размеры картинки, размеры и количество кусков. Надо понять, как резать
			//Будем искажать картинку?
			
			//по количеству кусков надо определить количество строк и столбцов, чтоб получились наименьшие искажения
			var rows = 0
				, cols = canvasCnt
				, minDiff = Infinity
				, ratio
				, chunkRatio = _chunkW/_chunkH
				, sWidth, sHeight	//ширина и высота куска в картинке
				, diff
				;
			while (cols > 1) {
				rows ++;
				cols = canvasCnt/rows;
				if (Math.floor(cols) != cols) {
					continue;	// не делится нацело
				}
				
				sWidth = Math.floor(img.width / cols);
				sHeight = Math.floor(img.height / rows);
				ratio = sWidth/sHeight;
				diff = Math.abs(chunkRatio - ratio);
				if (diff < minDiff) {
					minDiff = diff;
					imgCut.rows = rows;
					imgCut.cols = cols;
				}
			}
			return recalculateAndGetObject(_chunkW, _chunkH);
		}	
		/**
		 * Вспомогательная, возвращает методы для прорисовки канв
		 * @param {type} _chunkW
		 * @param {type} _chunkH
		 * @returns {findPair._L5.imagePreparator._L150.recalculateAndGetObject.Anonym$1}
		 */
		function recalculateAndGetObject(_chunkW, _chunkH) {	
			var chunkRatio = _chunkW/_chunkH;
			//Чтоб не было искажений, определяем, на сколько надо уменьшить высоту или ширину канвы
			//и запоминаем все в переменных
			var sWidth = Math.floor(img.width / imgCut.cols)
				, sHeight = Math.floor(img.height / imgCut.rows)
				, ratio = sWidth/sHeight
				, fillingW = _chunkW, fillingH = _chunkH	
				, blankW = 0, blankH = 0
				;
				
			if (chunkRatio > ratio) {
				//надо уменьшать ширину канвы
				fillingW = Math.floor(ratio * _chunkH);	//по правилам пропорции
				blankW = Math.floor((_chunkW - fillingW) /2);
			} else if (chunkRatio < ratio) {
				//надо уменишить высоту канвы
				fillingH = Math.floor(_chunkW / ratio);	//по правилам пропорции
				blankH = Math.floor((_chunkH - fillingH) /2);
			}	

			//Для того, чтоб на рубашке карты не было искажений, 
			//тоже определяем высоту и ширину заполняемой области канвы
			var shirt = {blankW:0, blankH: 0, w: _chunkW, h: _chunkH}
				, imgRatio = img.width/img.height;
			if (chunkRatio > imgRatio) {
				shirt.w = Math.floor(imgRatio * _chunkH);	//по правилам пропорции
				shirt.blankW = Math.floor((_chunkW - shirt.w) /2);
			} else if (chunkRatio < imgRatio) {
				shirt.h = Math.floor(_chunkW / imgRatio);	//по правилам пропорции
				shirt.blankH = Math.floor((_chunkH - shirt.h) /2);
			}

			/**
			 * Здесь возвращаем функции
			 */
			return {
				/**
				 * По номеру заполняет переданную канву картинкой
				 * @param {DOM Object} _node
				 * @param {Integer} _idx
				 * @param {Float} _angle
				 * @returns {DOM Object}
				 */
				fill: function(_node, _idx, _angle) {
					resize(_node, _chunkW, _chunkH);
					
					var ctx = _node.getContext('2d');
					//для начала заполним фон канвы
					ctx.fillStyle="#000000";
					//Вычисляем поворот
					var rectW = Math.abs(Math.cos(_angle) * _chunkW)
						, rectX = (_chunkW - rectW)/2;
					ctx.fillRect(rectX,0,rectW,_chunkH); 
					//---
					
					var source, target;
					if (_angle < HALF_PI) {
						//рубашка
						source = {dx: 0, dy: 0, w: img.width, h: img.height};
						target = {dx: 0, dy: shirt.blankH, w: shirt.w, h: shirt.h};
					} else {
						_idx = parseInt(_idx) % canvasCnt;
						var x = Math.floor(_idx/imgCut.rows)
							, y = _idx - x * imgCut.rows
							;
						source = {
							dx: sWidth * x, dy: sHeight * y, w: sWidth, h: sHeight
						};	
						target = {
							dx: 0, dy: blankH, w: fillingW, h: fillingH
						};
					}		
					
					//Вычисляем поворот
					target.w = Math.abs(Math.cos(_angle) * target.w);
					target.dx = (_chunkW - target.w)/2 

					ctx.drawImage(img
						, source.dx, source.dy  //смещение в исходном
						, source.w, source.h //высота и ширина вырезаемой части
						, target.dx, target.dy //смещение в канве
						, target.w, target.h //высота и ширина в канве
					);
					return _node;	
				}
				/**
				 * Наполняет переданную канву целой картинкой
				 * @param {DOM Object} _node
				 * @returns {DOM Object}
				 */
				, getFull: function(_node) {
					var ctx = _node.getContext('2d');
					var showSourceW = sWidth * imgCut.cols
						, showSourceH = sHeight * imgCut.rows
						;
					
					//Посмотрим, как надо отображать, чтоб не было мскажений
					var sourceRatio = showSourceW/showSourceH
						, targetRatio = _node.width / _node.height
						, target = {dx: 0, dy: 0, w: _node.width, h: _node.height};
						
					if (targetRatio > sourceRatio) {
						//меняем у заполняемой канвы ширину
						target.w = Math.floor(sourceRatio * _node.height);	//по правилам пропорции
						target.dx = Math.floor((_node.width - target.w) / 2);
					} else if (targetRatio < sourceRatio) {
						target.h = Math.floor(_node.width / sourceRatio);	//по правилам пропорции
						target.dy = Math.floor((_node.height - target.h) /2);
					}	
					
					ctx.drawImage(img
						, 0 , 0 //смещение в исходном
						, showSourceW, showSourceH //высота и ширина вырезаемой части
						, target.dx, target.dy //смещение в канве
						, target.w, target.h
					);
					return _node;
				}
			};	
		}	

		var ret = {
			init: function(_imgUrl, _chunkW, _chunkH, _chunksCnt, _callback) {
				canvasCnt = _chunksCnt;
				img = new Image;
				img.addEventListener('load', function () {
					canvases = onLoad(_chunkW, _chunkH);
					_callback(canvases);
				});
				img.src = _imgUrl;
			}
			, redraw: function(_chunkW, _chunkH) {
				return recalculateAndGetObject(_chunkW, _chunkH);
			}
		};
		return ret;
	})();

	/**
	 * Верхний уровень - добавление канв, работа с событиями, 
	 * взаимодействие с остальными объектами.
	 */
	var htmlLayer = (function(_animator, _imagePreparator){
		var state = 0
			, nodes = []
			, blocked = false	//во время визуализации не реагируем на клики
			, canvases			//объект для заполнения канв
			, callbacks
			, helpNode
			, CONTAINER
			, COLUMS, ROWS, MARGIN
			;
			
		return {
			init: function(_container, _params, _imgUrl, _callbacks) {
				
				callbacks = _callbacks;
				CONTAINER = _container;
				if (!CONTAINER.className) {
					CONTAINER.className = 'findPairContainer';
				} else {
					CONTAINER.className += 'findPairContainer';
				}
				CONTAINER.innerHTML = '';
				COLUMS = parseInt(_params.colums);
				ROWS = parseInt(_params.rows);
				MARGIN = parseInt(_params.margin);
				
				var picturesCnt = COLUMS * ROWS / 2;
				
				if (Math.floor(picturesCnt) != picturesCnt) {
					_callbacks.onError('Параметры colums или rows должны быть четными!');
				}

				//готовим контейнер, определяем, какой высоты и ширины будут карты
				var containerWidth = CONTAINER.clientWidth
					, containerHeight = CONTAINER.clientHeight
					, cardWidth = Math.floor((containerWidth - MARGIN * COLUMS) / COLUMS)
					, cardHeight = Math.floor((containerHeight - MARGIN * ROWS) / ROWS)
//					, containerBox = CONTAINER.getBoundingClientRect()
					;
				_imagePreparator.init(
					_imgUrl
					, cardWidth
					, cardHeight
					, picturesCnt
					, function(_canvases) { //Этот калбак запустится после загрузки картинки
						canvases = _canvases;	
						for(var x = 0; x < COLUMS; x ++) {
							for (var y=0; y < ROWS; y ++) {
								//var cardNode = document.createElement('div');
								var cardNode = document.createElement('canvas');
								cardNode.className = 'findPairCard';
								cardNode.style.margin = '0 0 ' + MARGIN + 'px ' + MARGIN + 'px';
								CONTAINER.appendChild(cardNode);
								var idx = nodes.length;
								cardNode.setAttribute('idx', idx);
								cardNode.setAttribute('open', 0);

								cardNode.addEventListener('click', htmlLayer.onclick);	
								nodes.push(cardNode);
								//Проблема - кусков в канве в 2 раза меньше! ориентироваться по номеру
								canvases.fill(cardNode, idx, 0);
							}
						}
						//Делаем канву для картинки целиком 
						helpNode = document.createElement('canvas');
						helpNode.style.position = 'absolute';
						helpNode.style.top = 0;//parseInt(containerWidth/4) + 'px';
						helpNode.style.left = 0;
						helpNode.style.background = 'black';
						helpNode.style.opacity = 0;
						helpNode.style.display = 'none';
						CONTAINER.appendChild(helpNode);	
						
						helpNode.addEventListener('click', htmlLayer.helpHide);	

						helpNode.width = containerWidth;
						helpNode.height = containerHeight;
						canvases.getFull(helpNode);						
						
						//перемешивание и пр.
						gameCore.init(picturesCnt);
						
						if (callbacks.successLoad) {
							callbacks.successLoad();
						}
					}
				);
			}
			, redraw: function() {
				//Запустить перерасчет для канв (какого размера, сколько отступать)
				//определяем, какой высоты и ширины будут карты
				var containerWidth = CONTAINER.clientWidth
					, containerHeight = CONTAINER.clientHeight
					, cardWidth = Math.floor((containerWidth - MARGIN * COLUMS) / COLUMS)
					, cardHeight = Math.floor((containerHeight - MARGIN * ROWS) / ROWS)
					;
				
				canvases = _imagePreparator.redraw(cardWidth, cardHeight);
				//Пробежаться по канвам и перерисовать их
				var mixedPairs = gameCore.getMixedPairs();
				for (var i=0; i < mixedPairs.length; i++) {
					var node = nodes[i], contentNode = mixedPairs[i];
					var angle = parseInt(node.getAttribute('open')) ? PI : 0;
					canvases.fill(node, contentNode, angle);
				}
				
				//перерисовать helpNode
				helpNode.width = containerWidth;
				helpNode.height = containerHeight;
				canvases.getFull(helpNode);						
			}
			/**
			 * Рекакция на клик
			 * @param {Event} _e
			 * @returns {undefined}
			 */
			, onclick: function(_e) {
				//надо открыть карту, 
				if (blocked) {
					return;
				}
				var idx = parseInt(this.getAttribute('idx'))
					, found = gameCore.getById(idx);
				if (-1 == found) {
					return;	//карточка уже открыта
				}
				blocked = true;
				var thisNode = this;
				//вместо визуализации
				thisNode.setAttribute('open', 1);
				_animator.open({
					show: function(_angle) {
						canvases.fill(thisNode, found, _angle);
					}
					, stop: function() {

						if (gameCore.pairOpened()) {
							var pair = gameCore.getClosingPair();
							if (pair) {
								setTimeout(function() {htmlLayer.closePair(pair)}, 500);
								return;
							}	
							//Если пары открыты верно, то не будем ждать и сразу проверим на выигрыщ
							var steps = gameCore.checkWin();
							if (steps) {
								htmlLayer.animationHelpNode
									( function(_steps) {
										if (callbacks.onWin) {
											callbacks.onWin(_steps);
										} else {
											alert('You win!');
										}	
									}
									, steps
								);
								return;
							} 
						} 
						blocked = false;
					}
				});
			}
			, closePair: function(_pair) {
				for (var i=0; i<_pair.length; i++) {
				   nodes[_pair[i][0]].setAttribute('open', 0);
				}	
				_animator.close({
					show: function(_angle) {
						 for (var i=0; i<_pair.length; i++) {
							 canvases.fill(nodes[_pair[i][0]], _pair[i][1], _angle);
						 }	
					}
					, stop: function() {
						 blocked = false;
					}
				});
			}
			, animationHelpNode: function(_callback, _steps) {
				var opacity = 0, dOpacity = .02;
				helpNode.style.display = 'block';								
				function step() {
					opacity += dOpacity;
					helpNode.style.opacity = opacity;
					if (opacity < 1) {
						App.newFrame(step);
					} else {
						_callback(_steps);
					}
				}
				step();
			}
			, helpShow: function() {
				if (blocked) {
					return;
				}
				helpNode.style.display = 'block';
				helpNode.style.opacity = 1;
			}
			, helpHide: function() {
				if (blocked) {
					return;
				}
				helpNode.style.display = 'none';
				helpNode.style.opacity = 0;
				
			}
			, helpTrigger: function() {
				if ('block' == helpNode.style.display) {
					this.helpHide();
				} else {
					this.helpShow();
				}
			}
		};
	})(animator, imagePreparator);
	
	/**
	 * Интерфейс
	 * @returns {Object}
	 */
	return {
		/**
		 * Запуск игры. Должен запускаться после того, как документ построен
		 * @param {String} _imgUrl
		 * @param {DOM Object} _container
		 * @param {Array} _params
		 * @param {Object} _callbacks
		 * @returns {undefined}
		 */
		run: function(_imgUrl, _container, _params,  _callbacks){
			var defaultParams = [['colums', 6], ['rows', 4], ['margin', 1]];
			defaultParams.forEach(function(_el){
				if (undefined == _params[_el[0]]) {
					_params[_el[0]] = _el[1];
				}
			});
			
			if (!_callbacks.onError) {
				_callbacks.onError = function onError(_str) {
					throw new Exception(_str);
				};
			}
			htmlLayer.init(_container, _params, _imgUrl, _callbacks);
		}
		, redraw: function() {
			htmlLayer.redraw();
		}
		, help:  {
			show: function() {
				return htmlLayer.helpShow();
			}
			, hide: function() {
				return htmlLayer.helpHide();
			}
			, trigger: function() {
				return htmlLayer.helpTrigger();
			}
		}
	};
}());



