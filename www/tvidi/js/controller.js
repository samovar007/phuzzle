/* 
 * @author: Samoylov Vasily
 * devphuzzle@gmail.com
 */

if (checkBrowser) {

(function($) {
	var TOP_PAGE = document.referrer
		, IMG 
		, getParams = App.getParams(window.location.search)
		;
		
//console.log(document.referrer);	

	$(document).ready(function() {
		//Иницилизация
		var callbacks = {	
			win: function(_msec) {
				var s = Math.floor(_msec/1000)
					, secStr = s + ' секунд' + App.wordEnding(s, {one: 'у', some: 'ы', many: ''})
					;
				App.sharing.init(TOP_PAGE
					, 'Я крут! Я собрал этот пазл за ' + secStr
					, IMG
					, 'Спорим, ты не сможешь побить мой рекорд?'
				);
				var wndBody	= '<h1>Готово!</h1>Ты собрал пазл за ' + 
						secStr + '. Нажми на картинку любимой соц. сети и поделись своей крутостью с друзьями!'
					+ '<div id="sharingContainer">'
					+ '<a target=_blank href="#" class="snicon vk" onclick="return App.popup(App.sharing.vk());"></a>'
					+ '<a target=_blank href="#" class="snicon ok" onclick="return App.popup(App.sharing.ok());"></a>'
					//+ '<a target=_blank href="#" class="snicon mr" onclick="return App.popup(App.sharing.mr());"></a>'
					+ '</div>'
					;//+ '<a href="http://phuzzle.ru" target=_blank>Попробуй собрать другие картинки</a>';
				App.cover.wnd('Пазл собран!', wndBody);
			}
			, successLoad: function() {
				App.cover.off();
			} 
		};
		App.cover.text('Загружаю рисунок...');
		
		var gameMode = getParams.mode ?  getParams.mode: 'default';
		switch (gameMode) {
			case 'phuzzle':
				IMG = 'http://storage1.tvidi.com/MyWorld/Users/9/c/4/23951_130467800317377272639_Original.jpg';
				puzzle.run(IMG
					, document.getElementById('puzzle')
					, [6, 6]
					, callbacks				
					, null
				);
				break;
			case 'phuzzle2':	
				IMG = 'http://storage1.tvidi.com/MyWorld/Users/9/c/7/23951_130547362278641199114_Original.jpg';
				puzzle.run(IMG
					, document.getElementById('puzzle')
					, [6, 6]
					, callbacks				
					, null
				);
				break;
			default: 
				IMG = 'http://phuzzle.ru/charactersPromBack.png'
				twelve.run(IMG
					, document.getElementById('puzzle')
					, [4, 3]
					, callbacks
					, null
				);
				break;	
		}

		App.cover.off();
				
	});
}(jQuery));


}