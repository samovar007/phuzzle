<?php
namespace Common\Social;
/**
 *
 * @author vsamoylov
 */
class Ok extends AbModel {
	
	protected function getOauthUrl($_scope = '') {
		$scope = $_scope ? ('&scope=' . $_scope) : '';
		return 'http://www.odnoklassniki.ru/oauth/authorize'
				. '?client_id='	. urlencode($this->provider['clientId'])
				. '&redirect_uri=' . urlencode($this->provider['retpath'])
				. $scope
				. '&response_type=code';
	}
	public function getToken() {
		$code = $this->getCallbackParams();
		
		//Получаем токен
		$curl = curl_init('http://api.odnoklassniki.ru/oauth/token.do');
		curl_setopt($curl, CURLOPT_POST, 1);
		curl_setopt($curl, CURLOPT_POSTFIELDS, implode('&', array(
			'code=' . $code
			, 'redirect_uri=' . $this->provider['retpath']
			, 'grant_type=authorization_code'	
			, 'client_id=' . $this->provider['clientId']
			, 'client_secret=' . $this->provider['secretKey']	
			)));
		
		$auth = $this->getJsonFromCurl($curl);
		if (!isset($auth->access_token)) {
			throw new \Exception(__METHOD__ . __LINE__ . ': access_token not found. ' . var_export($auth, true));
		}
		return $auth;
	}	
	
	public function getProfile($_token) {
		//Из доки:
		//1. Методы API нужно вызывать с помощью параметра access_token вместо session_key
		//2. Каждый параметр подписи запроса sig вычисляется немного иным способом, чем обычно:
		//sig = md5( request_params_composed_string+ md5(access_token + application_secret_key)  )
		//Не включайте маркер доступа access_token в request_params_composed_string
		$sign = md5('application_key=' . $this->provider['appKey'] . 'method=users.getCurrentUser' 
				. md5($_token->access_token .  $this->provider['secretKey'])
				);
		//Получаем инфу о юзере
		$curl = curl_init('http://api.odnoklassniki.ru/fb.do?access_token=' 
			. $_token->access_token 
			. '&application_key=' . $this->provider['appKey'] 
			. '&method=users.getCurrentUser'
			. '&sig=' . $sign
			);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		
		$profile = $this->getJsonFromCurl($curl);
		if (!isset($profile->uid)) {
			throw new Exception(__METHOD__ . __LINE__ . ': uid not found: ' . var_export($this->profile, true));
		}
		return $profile;
	}
	/**
	 * Получаем инфу в формате json из запроса, в котором не требуется указание сессии
	 * @param array $_params
	 * @return string json
	 */
	private function getJsonWoSession($_params) {
		$sign = $this->makeSign($_params);
		$url = 'http://api.odnoklassniki.ru/fb.do?' . implode('&', $_params) . '&sig=' . $sign;
		return \Utils\getByCurl($url);
	}
	
	public function getPhotosJson($_profile, $_aid) {
		$params = array(
			'method=photos.getPhotos'
			, 'application_key=' . $this->provider['appKey']
			, 'uid=' . $_profile->uid
			, 'format=JSON'	
		);
		if ($_aid) {
			$params[] = 'aid=' . $_aid;
		}
		return $this->getJsonWoSession($params);
	}
	
	public function getAlbumsJson($_profile) {
		$params = array(
			'method=photos.getAlbums'
			, 'application_key=' . $this->provider['appKey']
			, 'uid=' . $_profile->uid
			, 'format=JSON'	
		);
		return $this->getJsonWoSession($params);
	}
	
	
	private function makeSign($_params) {
		sort($_params);
		$sign = strtolower(md5(implode('', $_params) . $this->provider['secretKey']));
		return $sign;
	}
	/**
	 * Вспомогательная - обращение через иницилизированный curl для получения ответа в формате json
	 * @param type $_curl
	 * @return type
	 * @throws Exception
	 */
	protected function getJsonFromCurl($_curl) {
		curl_setopt($_curl, CURLOPT_RETURNTRANSFER, 1);
		$result = curl_exec($_curl);
		$error = curl_error($_curl);
		curl_close($_curl);
		if ($error) {
			throw new \Exception(__METHOD__ . ' curl error: ' . $error);
		}
		$json = @json_decode($result);
		if (!$json) {
			throw new \Exception(__METHOD__ . ' curl return not json: ' . $result);
		}
		return $json;
	}

}

