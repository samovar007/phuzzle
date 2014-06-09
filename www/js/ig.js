/**
 * @author: Vasily Samoylov
 * devphuzzle@gmail.com
 */
var igPhotos = (function($){
	var $container = $('#photos').append('<h2>Последние фото ленты Инстаграма</h2><div id="album0" class="albumData"></div>');

	$.getJSON('/getPhotos/ig/json/albums', function(_data){
//console.log(_data);		
		if (!_data || !_data.data) {
			return;
		}
		var $album = $('#album0');
		_data.data.forEach(function(_el){
			if ('image' != _el.type) {
				return;
			}
			$(makeLinkToPhuzzle(_el.images.standard_resolution.url
					, -1
					, '<img src="' + _el.images.thumbnail.url + '">'))
				.appendTo($album);
		});
	});

	
}(jQuery));
