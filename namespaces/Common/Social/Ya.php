<?php
namespace Common\Social;
/**
 *
 * @author vsamoylov
 */
class Ya extends AbModel {
	
	protected function getOauthUrl($_scope = '') {
		//$scope = $_scope ? ('&scope=' . $_scope) : '';
        return 'https://oauth.yandex.ru/authorize'
			. '?client_id=' . urlencode($this->provider['clientId'])
            . '&response_type=code&display=popup';
	}
	
	public function getToken() {
		$code = $this->getCallbackParams();
		
		$rawData = \Utils\getByCurl('https://oauth.yandex.ru/token'
			, 'client_id=' . urlencode($this->provider['clientId']) 
				. '&client_secret='	. urlencode($this->provider['secretKey'])
				. '&grant_type=authorization_code'
				. '&code=' . urlencode($code)
			);
//var_dump($rawData); 
		if (!$rawData) {
			throw new \Exception('Не удалось получить токен');
		}
		
		$encodedData = json_decode($rawData, true);
		if (empty($encodedData['access_token'])) {
			throw new \Exception('Не удалось получить корректный токен.'
				. (isset($encodedData['error']) ? (' ' . $encodedData['error']) : '')	
				. (isset($encodedData['error_description']) ? (' ' . $encodedData['error_description']) : '')	
					);
		}
		return $encodedData;
	}
	
	public function getProfile($_token) {
		return 1;
    }
	
	public function getFotkiServiceDocumentUrl($_token) {
		$rawData = \Utils\getByCurl('http://api-fotki.yandex.ru/api/me/?oauth_token=' . $_token['access_token']
			, ''
			, array(CURLOPT_HEADER => 1, CURLOPT_FOLLOWLOCATION => false)
			);	
		if (!preg_match('/Location: (http:\/\/[^\s]+)/mi', $rawData, $ar)) {
			throw new \Exception('Не удалось получить фото, возможно вы не зарегистрированы');
		} 
		return $ar[1];
//		if (!$rawData) {
//			throw new \Exception('Не удалось получить документ с ссылками на альбомы');
//		}
//		
//		$encodedData = json_decode($rawData, true);
//var_dump($encodedData); exit;			
//		return $rawData;
	}
}

