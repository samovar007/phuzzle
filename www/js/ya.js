/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var yaPhotos = (function($){
	var $container = $('#photos').append('<h2>Альбомы</h2>');
	var albums;

	var obj = {
		setMasterUrl: function(_url) {
			App.jsonp(_url + '?format=json&callback=yaPhotos.cbMasterUrlData');
		}
		, cbMasterUrlData: function(_data){
			if (!_data.collections || !_data.collections['album-list']) {
				throw new Error('Фотографии не найдены');
			}
			App.jsonp(_data.collections['album-list'].href + '?format=json&callback=yaPhotos.cbAlbumList');
		}

		, cbAlbumPhotos: null

		, cbAlbumList: function(_data) {
			albums = _data.entries;
			yaPhotos.cbAlbumPhotos = Array(albums.length);
			albums.forEach(function(_el, _key){
				$('<div class="albumPic"><img src="' + _el.img.S.href + '" title="' + _el.title + '"><p>' + _el.title + '</p></div>')
					.on('click', function(){yaPhotos.switchAlbum(_key)})
					.appendTo($container);
				$('<div id="album' + _key + '" class="albumData displayNone"></div>').appendTo($container);	
			});
			
		}
		, switchAlbum: function(_aid) {
			var $node = $('#album' + _aid);
			if (!yaPhotos.cbAlbumPhotos[_aid]) {
				return yaPhotos.getAlbumPhotos(_aid);
			}
			$node.toggleClass('displayNone');
		}
		, getAlbumPhotos: function (_aid) {
			var $node = $('#album' + _aid)
				, url = albums[_aid].links.photos;
				
			yaPhotos.cbAlbumPhotos[_aid] = function(_data) {
				if (!_data || !_data.entries) {
					return;
				}
				var $album = $('#album' + _aid)
					, str = '';
				_data.entries.forEach (function(_el){
					var imgKeys = ['orig', 'XXXL', 'XXL', 'XL', 'L'], href = '-';
					for (var i = 0; i < imgKeys.length; i ++) {
						if (_el.img[imgKeys[i]]) {
							href = _el.img[imgKeys[i]].href;
							break;
						}
					}
					str += makeLinkToPhuzzle(href, -1, '<img src="' + _el.img.S.href + '" title="' + _el.title + '">');
				});
				$album.html(str);
				$album.removeClass('displayNone');
			}
			App.jsonp(url + '&callback=yaPhotos.cbAlbumPhotos[' + _aid + ']');
		}

	};
	return obj;
}(jQuery));

