/* 
 * @author: Samoylov Vasily
 * devphuzzle@gmail.com
 */

/**
 * Для шаринга в одноклассниках
 * @returns {undefined}
 */
!function (d, id, did, st) {
  var js = d.createElement("script");
  js.src = "http://connect.ok.ru/connect.js";
  js.onload = js.onreadystatechange = function () {
  if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
    if (!this.executed) {
      this.executed = true;
      //setTimeout(function () {onOkConnectReady()}, 0);
    }
  }}
  d.documentElement.appendChild(js);
}(document);


var Site = Site || App;

(function($) {
	var  complexityAr = [{complexity: [3, 3], describe: 'Фазл 3x3', game: 'puzzle', nomenu: 1}
			, {complexity: [6, 6], describe: 'Фазл 6x6', game: 'puzzle'}
			, {complexity: [12, 12], describe: 'Фазл 12x12', game: 'puzzle', nomenu: 1}
			, {complexity: [3, 4], describe: 'Фрубик', game: 'twelve'}
			, {describe: 'Пятнашки', game: 15}
			, {complexity: [6, 6, 0], describe: 'Фёртыш детский', game: 'phertish', nomenu: 1}
			, {complexity: [3, 3, 1], describe: 'Фёртыш 3x3', game: 'phertish'}
			, {complexity: [5, 5, 1], describe: 'Фёртыш 5x5', game: 'phertish', nomenu: 1}
			, {complexity: [3, 3, 1], describe: 'Раскладушка', game: 'untuck'}
			, {complexity: [4, 3], describe: 'Найди пару', game: 'findPair'}
			, {complexity: true, describe: 'Шарики', game: 'balls'}
		];
		
	function getBigImgHrefFromYandex(_elImg) {
		var el = ['XXXL', 'XXL', 'XL'];
		for(var i=0; i<el.length; i++) {
			var key = el[i];
			if (_elImg[key] && _elImg[key].href) {
				return _elImg[key].href;
			}
		}
		return false;	
	}
	//Если каких-то данных нет...
	function showStep1() {
		App.showYfd = function(_data) {
			var $container = $('#yfdExamplePlace');
			if (!_data.entries ||!_data.entries.length) {
				return;
			}
			var str = '';
			_data.entries.forEach(function(_el){
				str += '<div class="col-xs-4">' 
					+ makeLinkToPhuzzle(getBigImgHrefFromYandex(_el.img), -1, '<img src="' + _el.img.S.href + '" title="' + _el.title + '">') 
					+ '</div>';
			});
			$container.html(str);
			
			var gamesMenuAr = []
				, imgSrc = getBigImgHrefFromYandex(_data.entries[0].img)
				;
			complexityAr.forEach(function(_el, _idx){
				if (_el.nomenu) {
					return;
				}
				gamesMenuAr.push(makeLinkToPhuzzle(imgSrc, _idx, '&laquo;' + _el.describe + '&raquo;'));
			});	
			$('#allGames').html(gamesMenuAr.join(', ') );
			
		};	
		App.jsonp('http://api-fotki.yandex.ru/api/podhistory/?limit=3&format=json&callback=App.showYfd');
		$('#step1').show();
		$('#step2').hide();
	}
	//начинаем игру
	function showStep2(_imgSrc, _complexityIdx) {
		$('#step2').show();
		$('#step1').hide();

		$('#currentImg').val(_imgSrc);
		var options = '';
		complexityAr.forEach(function(_el, _idx){
			if (_el.nomenu) {
				return;
			}
			if (_complexityIdx == _idx) {
				options += '<span>' + _el.describe + '</span>';
			} else {
				options += makeLinkToPhuzzle(_imgSrc, _idx, _el.describe);
			}	
		});
		$('#currentImgComplexity').html(options);
	}
	

	$(document).ready(function() {
		//Иницилизация
		var getVars = App.getParams(window.location.search);
		if (!getVars.img) {
			return showStep1();
		}
		getVars.img = getVars.img.replace(/[^-a-zA-Z0-9\._:&=\?\/]+/, '');
		var complexityIdx = parseInt(getVars.complexity);
		if (!complexityAr[complexityIdx]) {
			complexityIdx = 0;
		}
		App.storeLastComplexity(complexityIdx);
		showStep2(getVars.img, complexityIdx);
		App.cover.text('Загружаю рисунок...');
		
		
		function commonOnWin(_phraseForSharing, _phraseForWnd) {
			App.sharing.init(location.protocol + '//' + location.host + '/toSn/' + location.search
				, 'Фазлы - головоломки из любого изображения'
				, getVars.img
				, _phraseForSharing
			);
			var wndBody	= _phraseForWnd
				+ ' Поделитесь своим успехом с друзьями!'
				+ '<div id="sharingContainer">'
				+ '<a target=_blank href="#" class="snicon vk" appSharingType="vk" onclick="return App.sharing.onclick(this);"></a>'
				//+ '<a target=_blank href="#" class="snicon ok" appSharingType="ok" onclick="return App.sharing.onclick(this);"></a>'
				+ '<div id="ok-sharing-widget" class="snicon ok" style="display: inline-block"></div>'
				+ '<a target=_blank href="#" class="snicon mr" appSharingType="mr" onclick="return App.sharing.onclick(this);"></a>'
				+ '<a target=_blank href="#" class="snicon gg" appSharingType="gg" onclick="return App.sharing.onclick(this);"></a>'
				+ '<a target=_blank href="#" class="snicon fb" appSharingType="fb" onclick="return App.sharing.onclick(this);"></a>'
				+ '<a target=_blank href="#" class="snicon tw" appSharingType="tw" onclick="return App.sharing.onclick(this);"></a>'
				+ '</div>'
				+ '<p>Или разместите <a href="' + location.href + '">ссылку</a> самостоятельно.</p>' 
				+ '<footer><a href="" class="btn">Ещё раз</a> <a href="/getPhotos/' + App.getLastSource() + '/" class="btn">Другое фото</a></footer>';
			App.cover.wnd('Пазл собран!', wndBody);

			OK.CONNECT.insertShareWidget("ok-sharing-widget"
				, App.sharing.url.replace(/http%3A/, '')	//одноглазники не шарят, если есть http
				, "{width:32,height:32,st:'rounded',sz:30,nt:1,nc:1}");
			if (ga) {
				ga('send', 'event', 'puzzleComplete', complexityIdx);
			}
		}
		
		
		var callbacks = {	
			win: function(_msec) {
				var s = Math.floor(_msec/1000);
				commonOnWin
					( 'Я собрал этот пазл за ' + s + ' секунд' + App.wordEnding(s, {one: 'у', some: 'ы', many: ''})
					, 'Вы справились с заданием за ' + s + ' секунд' + App.wordEnding(s, {one: 'у', some: 'ы', many: ''}) + '!'
					);
			}
			, winWithSteps: function(_steps) {
				commonOnWin
					( 'Я выполнил задание за ' + _steps + ' шаг' + App.wordEnding(_steps, {one: '', some: 'а', many: 'ов'})
					, 'Вы справились с заданием за ' + _steps + ' шаг' + App.wordEnding(_steps, {one: '', some: 'а', many: 'ов'}) + '!'
					);
			}
			, winWithPointers: function(_pointers) {
				var wordWithEnd = _pointers + ' очк' + App.wordEnding(_pointers, {one: 'о', some: 'а', many: 'ов'});
				commonOnWin
					( 'Я набрал ' + wordWithEnd
					, 'Вы справились с заданием и набрали ' + wordWithEnd + '!'
					);
			}
			, successLoad: function() {
				App.cover.off();
			} 
			, onLoss: function() {
				var wndBody	= ' К сожалению вы проиграли. Попробуйте еще раз!'
					+ '<footer><a href="" class="btn">Ещё раз</a> <a href="/getPhotos/' + App.getLastSource() + '/" class="btn">Другое фото</a></footer>';
				App.cover.wnd('Вы проиграли :(', wndBody);
			}
		};




		var gameType = complexityAr[complexityIdx].game;
		var helpButtonNode = document.getElementById('puzzleHelp');
		var containerNode = document.getElementById('puzzle');
		switch (gameType) {
			case 'puzzle':
				puzzle.run(getVars.img
					, containerNode
					, complexityAr[complexityIdx].complexity
					, callbacks				
					, helpButtonNode
				);
				break;
			case 'twelve':
				twelve.run(getVars.img
					, containerNode
					,  complexityAr[complexityIdx].complexity
					, callbacks
					, helpButtonNode
				);
				break;
			case 15:
				fifteen.run(getVars.img
					, containerNode
					, callbacks				
					, helpButtonNode
				);
				break;
			case 'phertish':
				phertish.run(getVars.img
					, containerNode
					,  complexityAr[complexityIdx].complexity
					, callbacks
					, helpButtonNode
				);
				break;
			case 'untuck':
				untuck.run(getVars.img
					, containerNode
					,  complexityAr[complexityIdx].complexity
					, callbacks
					, helpButtonNode
				);
				break;
			case 'findPair':
				var cr = complexityAr[complexityIdx].complexity;
				callbacks.onWin = callbacks.winWithSteps;
				
				findPair.run(getVars.img
					, containerNode
					, {colums: cr[0], rows: cr[1]}
					, callbacks
				);
				$(window).on('resize', function() {
					findPair.redraw();
				});			
				$(window).on('orientationchange', function() {
					//Без таймаута на моем планшете работает не верно
					setTimeout(findPair.redraw, 200);
				});
				
				//@todo - хорошо бы это распространить на все игры!
				var currentGame = findPair;
				if (!currentGame.help) {
					helpButtonNode.style.display = 'none';
				} else {
					if (!!('ontouchstart' in window)) {	//touch screen
						helpButtonNode.addEventListener('click', currentGame.help.trigger);	

					} else {
						helpButtonNode.addEventListener('mousedown', currentGame.help.show);		
						helpButtonNode.addEventListener('mouseup', currentGame.help.hide);
						helpButtonNode.addEventListener('mouseleave', currentGame.help.hide);
					}					
				}
				break;
			case 'balls':
				callbacks.onWin = callbacks.winWithPointers;
				ballsGame.run(getVars.img
					, containerNode
					//,  {w: 50, h: 30, lives: 3, percentToWin: 75, balls: 3}
					,  {w: 30, h: 15, lives: 3, percentToWin: 75, balls: 3, velocityKoef: .7}
					, callbacks
				);
				$(window).on('resize', function() {
					ballsGame.redraw();
				});			
				$(window).on('orientationchange', function() {
					//Без таймаута на моем планшете работает не верно
					setTimeout(ballsGame.redraw, 200);
				});
				helpButtonNode.style.display = 'none';
		}
	});
}(jQuery));


