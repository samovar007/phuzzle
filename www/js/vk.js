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
			var $photos = $('#photos');
			_data.response.forEach(function(_el){
				$('<img src="' + _el.thumb_src + '" title="' + _el.title + '">')
					.on('click', function(){photos.getAlbumData(_el.aid)})
					.appendTo($photos);
				$('<div id="album' + _el.aid + '"></div>').appendTo($photos);	
			});
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
			var $album = $('#album' + _data.response[0].aid);
			_data.response.forEach(function(_el){
				$(makeLinkToPhuzzle(_el.src_big, '<img src="' + _el.src + '">'))
					.appendTo($album);
			});
		}
	};
	return obj;
}());

