/**
 * @author: Vasily Samoylov
 * devphuzzle@gmail.com
 */
var igPhotos = (function($){
	var $container = $('#photos')
		.append('<h2>Последние фото ленты</h2><div id="album_feed" class="albumData"></div>')
		.append('<h2>Популярные</h2><div id="album_popular" class="albumData"></div>');

	function getAlbum(_type) {
		$.getJSON('/getPhotos/ig/json/' + _type, function(_data){
			var $album = $('#album_' + _type), cnt = 0;
			if (_data && _data.data) {
				_data.data.forEach(function(_el){
					if ('image' != _el.type) {
						return;
					}
					cnt ++;
					$(makeLinkToPhuzzle(_el.images.standard_resolution.url
							, -1
							, '<img src="' + _el.images.thumbnail.url + '">'))
						.appendTo($album);
				});
			}
			if (!cnt) {
				$album.html('Изображений не найдено');
			}
		});
	}	
	getAlbum('feed');
	getAlbum('popular');
	
}(jQuery));
