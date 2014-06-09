<?php
namespace Common\Social;
/**
 *
 * @author vsamoylov
 */
class Ig extends AbModel {
	
	protected function getOauthUrl($_scope = '') {
		$scope = $_scope ? ('&scope=' . $_scope) : '';
//https://api.instagram.com/oauth/authorize/?client_id=CLIENT-ID&redirect_uri=REDIRECT-URI&response_type=code		
        return 'https://api.instagram.com/oauth/authorize/'
			. '?client_id=' . urlencode($this->provider['clientId'])
            . '&redirect_uri=' . urlencode($this->provider['retpath'])
			. $scope	
            . '&response_type=code';
	}
	
	public function getToken() {
		$code = $this->getCallbackParams();
		
		$rawData = \Utils\getByCurl('https://api.instagram.com/oauth/access_token'
			, 'client_id=' . urlencode($this->provider['clientId']) 
				. '&client_secret='	. urlencode($this->provider['secretKey'])
				. '&grant_type=authorization_code'
				. '&code=' . urlencode($code)
				. '&redirect_uri=' . urlencode($this->provider['retpath'])
			);
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
		if (!isset($_token['user'])) {
			throw new \Exception('Не удалось получить профайл ($_token[user] not exists');
		}
		//нам пока и не нужно большего
		return $_token['user'];
    }
}

