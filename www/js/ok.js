/**
 * @author: Vasily Samoylov
 * devphuzzle@gmail.com
 */
var okPhotos = (function($){
	var $container = $('#photos').append('<div id="album0" class="albumData"></div><h2>Альбомы</h2>');
	var gotAlbumsData = {};

	function getAlbumPhotos(_aid) {
		var params = _aid ? {aid: _aid} : {};
		$.getJSON('/getPhotos/ok/json/photos', params, function(_data){
			if (!_data || !_data.photos) {
				return;
			}
			gotAlbumsData[_aid] = 1;
			var $album = $('#album' + _aid);
			_data.photos.forEach(function(_el){
				$(makeLinkToPhuzzle(_el.pic640x480, -1, '<img src="' + _el.pic128x128 + '">'))
					.appendTo($album);
			});
			$album.removeClass('displayNone');
		});
	}
	
	getAlbumPhotos(0);
	
	$.getJSON('/getPhotos/ok/json/albums', function(_data){
		_data.albums.forEach(function(_el){
			$('<div class="albumPic">' + _el.title + '</div>')
				.on('click', function(){okPhotos.switchAlbum(_el.aid)})
				.appendTo($container);
			$('<div id="album' + _el.aid + '" class="albumData displayNone"></div>').appendTo($container);	
		});
	});

	var obj = {
		switchAlbum: function(_aid) {
			if (!gotAlbumsData[_aid]) {
				return getAlbumPhotos(_aid);
			}
			$('#album' + _aid).toggleClass('displayNone');
		}
	};

	return obj;
}(jQuery));

