<?php
namespace GetPhotos\Controller;
/**
 *
 * @author vsamoylov
 */
class Ok extends SocialAuth {
	
	protected $provider = array(
		'clientId' => 1089885952
		, 'secretKey' => '5DFF852B6227BBA9E041F8E7'
		, 'appKey' => 'CBAIFHPBEBABABABA'
		, 'name' => 'ok'
	);
	
	protected function getOauthUrl() {
		return 'http://www.odnoklassniki.ru/oauth/authorize?client_id='
				. $this->provider['clientId'] 
				. '&response_type=code&redirect_uri=' . $this->getRetpathForProvider()
				; //. '&scope=';
	}
	
	/**
	 * получение подготовленного профайла
	 */
	private function _getProfile() {
		if ($this->profile) {
			return $this->profile;
		}

		if (!isset($_GET['code'])) {
			$error = isset($_GET['error']) ? $_GET['error'] : '';
			throw new \Exception(__METHOD__ . __LINE__ . ': Параметр code не найден. ' . $error);
		}
		
		//Получаем токен
		$curl = curl_init('http://api.odnoklassniki.ru/oauth/token.do');
		curl_setopt($curl, CURLOPT_POST, 1);
		curl_setopt($curl, CURLOPT_POSTFIELDS, implode('&', array(
			'code=' . $_GET['code']
			, 'redirect_uri=' . $this->getRetpathForProvider()
			, 'grant_type=authorization_code'	
			, 'client_id=' . $this->provider['clientId']
			, 'client_secret=' . $this->provider['secretKey']	
			)));
		
		$auth = $this->getJsonFromCurl($curl);
		if (!isset($auth->access_token)) {
			throw new \Exception(__METHOD__ . __LINE__ . ': access_token not found. ' . var_export($auth, true));
		}
		
		//Получаем инфу о юзере
		$sign = md5('application_key=' . $this->provider['appKey'] . 'method=users.getCurrentUser' 
				. md5($auth->access_token .  $this->provider['secretKey'])
				);
		$curl = curl_init('http://api.odnoklassniki.ru/fb.do?access_token=' 
			. $auth->access_token 
			. '&application_key=' . $this->provider['appKey'] 
			. '&method=users.getCurrentUser'
			. '&sig=' . $sign
			);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		
		$this->profile = $this->getJsonFromCurl($curl);
		if (!isset($this->profile->uid)) {
			throw new \Exception(__METHOD__ . __LINE__ . ': uid not found: ' . var_export($this->profile, true));
		}
		
		//тест - проверяем работу подписи
		$params = array(
			'method=photos.getPhotos'
			, 'application_key=' . $this->provider['appKey']
			//, 'format=JSON'	
			, 'uid=' . $this->profile->uid
		);
		$sign = $this->makeSign($params);
		$url = 'http://api.odnoklassniki.ru/fb.do?' . implode('&', $params) . '&sig=' . $sign;
		echo $url;
		//---
		
		return $this->profile;
	}	
	/**
	 * полученеи подготовленного профайла
	 */
	protected function getProfile() {
		$profile = $this->_getProfile();
		return array
			( 'login' => $profile->uid
			, 'nick' => isset($profile->name) ? $profile->name : ''
			, 'email' => ''	//не отдают они нам мыла
			);
	}
	function makeSign($_params) {
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

