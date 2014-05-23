/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var photos = (function(){
	/**
	 * формирует и посылает jsonp запрос
	 */
	function jsonp(_src) {
		var s = document.getElementsByTagName('script')[0], n = document.createElement('script');
		n.type = 'text/javascript';
		n.async = true;
		n.src = _src;
		s.parentNode.insertBefore(n, s);
	}	
	
	var gotAlbumsData = {};
	
	var obj = {
		ownerId: null
		, apiUrl: 'https://api.vk.com/method/'
		, init: function(_ownerId) {
			this.ownerId = _ownerId;
			jsonp(this.apiUrl + 'photos.getAlbums?owner_id=' + this.ownerId 
				+ '&need_system=1&need_covers=1&callback=photos.showAlbumList'
				);
		}
		, showAlbumList: function(_data) {
			if (!_data.response) {
				throw Error('Данные об альбомах не пришли');
			}
			var $container = $('#photos');
			var $albumsCnt = 0;	
			_data.response.forEach(function(_el){
				if (0 == _el.size) {
					return;
				}
				$albumsCnt ++;
				$('<div class="albumPic">'
					+ '<img src="' + _el.thumb_src + '" title="' + _el.title + '">'
					+ '<p>' + _el.title + '</p>'
					+ '</div>'
					)
					.on('click', function(){photos.switchAlbum(_el.aid)})
					.appendTo($container);
				$('<div id="album' + _el.aid + '" class="albumData displayNone"></div>').appendTo($container);	
			});
			if (!$albumsCnt) {
				$container.html('Альбомов с фотографиями не найдено');
			}
		}
		, switchAlbum: function(_aid) {
			if (!gotAlbumsData[_aid]) {
				return this.getAlbumData(_aid);
			}
			$('#album' + _aid).toggleClass('displayNone');
		}
		, getAlbumData: function(_aid) {
			jsonp(this.apiUrl + 'photos.get?owner_id=' + this.ownerId
				+ '&album_id=' + _aid + '&callback=photos.showAlbum'
				);
		}
		, showAlbum: function(_data) {
			if (!_data.response) {
				throw Error('Данные о фотографиях альбома не пришли');
			}
			if (!_data.response[0]) {
				return;	//пустой результат
			}
			gotAlbumsData[_data.response[0].aid] = 1;
			var $album = $('#album' + _data.response[0].aid);
			$album.removeClass('displayNone');
			_data.response.forEach(function(_el){
				$(makeLinkToPhuzzle(_el.src_big, 1, '<img src="' + _el.src + '">'))
					.appendTo($album);
			});
		}
	};
	return obj;
}());

