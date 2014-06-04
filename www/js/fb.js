var fbPhotos = (function($){
	var gotAlbumsData = {};
	// Load the SDK asynchronously
	(function(d, s, id) {
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) return;
		js = d.createElement(s); js.id = id;
		js.src = "//connect.facebook.net/ru_RU/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));
	
	// This is called with the results from from FB.getLoginStatus().
	function statusChangeCallback(response) {
		$needAuth = $('#needAuth');
		if (response.status === 'connected') {
			// Logged into your app and Facebook.
			testAPI();
		} else if (response.status === 'not_authorized') {
			$('#needAuth').show();
		} else {
			$('#needAuth').show();
		}
	}
	window.fbAsyncInit = function() {
		FB.init({appId      : '730294570326409'
			, cookie     : true
			, xfbml      : true
			, version    : 'v2.0' 
		});
		
		FB.getLoginStatus(statusChangeCallback);
	};	
	

	// Here we run a very simple test of the Graph API after login is
	// successful.  See statusChangeCallback() for when this call is made.
	function testAPI() {
		$('#needAuth').hide();
		var $container = $('#photos').html('<div id="album0" class="albumData"></div><h2>Альбомы</h2>');
		FB.api('/me/photos', function(_data){
			fillAlbumPhotos(0, _data);
		});
		
		FB.api('/me/albums', function(_data){
			if (!_data || _data.error) {
				throw new Error('Ошибка при получении альбомов ' + _data.error);
			}
			var $albumsCnt = 0;	
			_data.data.forEach(function(_el){
				if (0 == _el.size) {
					return;
				}
				$albumsCnt ++;
				$('<div class="albumPic">'
					+ '<p>' + _el.name + '</p>'
					+ '</div>'
					)
					.on('click', function(){fbPhotos.switchAlbum(_el.id)})
					.appendTo($container);
				$('<div id="album' + _el.id + '" class="albumData displayNone"></div>').appendTo($container);	
			});
			if (!$albumsCnt) {
				$container.append('<p>Альбомов с фотографиями не найдено</p>');
			}
		});
	};
	
	function fillAlbumPhotos(_aid, _data) {
		if (!_data || _data.error || !_data.data) {
			throw new Error('Ошибка при получении фотографий ' + _data.error);
		}
		gotAlbumsData[_aid] = 1;
		var $album = $('#album' + _aid);
//console.log(_data);
		_data.data.forEach(function(_el){
			$(makeLinkToPhuzzle(_el.source, -1, '<img src="' + _el.picture + '">'))
				.appendTo($album);
		});
		$album.removeClass('displayNone');
	}

	function getAlbumPhotos(_aid) {
		FB.api('/' + _aid + '/photos', 
			function (_data) {
				fillAlbumPhotos(_aid, _data);
			}
		);
	};
	
  
	return {
		checkLoginState: function() {
			FB.getLoginStatus(statusChangeCallback);
		}
		, switchAlbum: function(_aid) {
			if (!gotAlbumsData[_aid]) {
				return getAlbumPhotos(_aid);
			}
			$('#album' + _aid).toggleClass('displayNone');
		}

  };
})(jQuery);

