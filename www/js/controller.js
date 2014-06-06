/* 
 * @author: Samoylov Vasily
 * devphuzzle@gmail.com
 */

(function($) {
	var  complexityAr = [{complexity: [3, 3], describe: 'Легкая', game: 'puzzle'}
			, {complexity: [6, 6], describe: 'Средняя', game: 'puzzle'}
			, {complexity: [12, 12], describe: 'Сложная', game: 'puzzle'}
			, {complexity: [3, 4], describe: 'Фрубик', game: 'twelve'}
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
				str += '<div class="col-xs-4">' + makeLinkToPhuzzle(_el.img.XXXL.href, -1, '<img src="' + _el.img.S.href + '" title="' + _el.title + '">') + '</div>';
			});
			$container.html(str);
		}	
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
		App.cookie.set('complexity', complexityIdx, Infinity, '/');
		showStep2(getVars.img, complexityIdx);

		App.cover.text('Загружаю рисунок...');
		var callbacks = {	
			win: function(_msec) {
				var s = Math.floor(_msec/1000);
				App.sharing.init(location.href
					, 'Фазлы - пазлы из любого изображения'
					, getVars.img
					, 'Я собрал этот пазл за ' + s + ' секунд' + App.wordEnding(s, {one: 'у', some: 'ы', many: ''})
				);
				var wndBody	= 'Вы справились с заданием за '
					+ s + ' секунд' + App.wordEnding(s, {one: 'у', some: 'ы', many: ''})
					+ '! Поделитесь своим успехом с друзьями!'
					+ '<div id="sharingContainer">'
					+ '<a target=_blank href="#" class="snicon vk" onclick="return App.popup(App.sharing.vk());"></a>'
					+ '<a target=_blank href="#" class="snicon ok" onclick="return App.popup(App.sharing.ok());"></a>'
					+ '<a target=_blank href="#" class="snicon mr" onclick="return App.popup(App.sharing.mr());"></a>'
					+ '<a target=_blank href="#" class="snicon gg" onclick="return App.popup(App.sharing.gg());"></a>'
					+ '<a target=_blank href="#" class="snicon fb" onclick="return App.popup(App.sharing.fb());"></a>'
					+ '<a target=_blank href="#" class="snicon tw" onclick="return App.popup(App.sharing.tw());"></a>'
					+ '</div>';
				App.cover.wnd('Пазл собран!', wndBody);
			}
			, successLoad: function() {
				App.cover.off();
			} 
		};

		if (complexityAr[complexityIdx].game == 'puzzle') {
			puzzle.run(getVars.img
				, document.getElementById('puzzle')
				, complexityAr[complexityIdx].complexity
				, callbacks				
				, document.getElementById('puzzleHelp')
			);
		} else {
			twelve.run(getVars.img
				, document.getElementById('puzzle')
				,  complexityAr[complexityIdx].complexity
				, callbacks
				, document.getElementById('puzzleHelp')
			);
			App.cover.off();
		}		
	});
}(jQuery));


