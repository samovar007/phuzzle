<?php
namespace Common\Social;
/**
 *
 * @author vsamoylov
 */
class Vk extends AbModel {
	
	protected function getOauthUrl($_scope = '') {
		$scope = $_scope ? ('&scope=' . $_scope) : '';
        return 'http://oauth.vk.com/authorize'
			. '?client_id=' . urlencode($this->provider['clientId'])
            . '&redirect_uri=' . urlencode($this->provider['retpath'])
			. $scope
            . '&display=popup&response_type=code';
	}
	
	public function getToken() {
		$code = $this->getCallbackParams();
		$token = \Utils\getByCurl('https://oauth.vk.com/access_token'
			. '?client_id=' . urlencode($this->provider['clientId'])
			. '&client_secret='	. urlencode($this->provider['secretKey'])
			. '&code=' . urlencode($code)
			. '&redirect_uri=' . urlencode($this->provider['retpath'])
			);
		if (!$token) {
			throw new \Exception('Не удалось получить токен');
		}

		$token = json_decode($token, true);
		if (empty($token['user_id'])) {
			throw new \Exception('Не удалось получить корректный токен.'
				. (isset($token['error']) ? (' ' . $token['error']) : '')	
				. (isset($token['error_description']) ? (' ' . $token['error_description']) : '')	
					);
		}
		return $token;
	}
	
	public function getProfile($_token) {
		$profile = \Utils\getByCurl(
			'https://api.vk.com/method/getProfiles?uid=' . urlencode($_token['user_id'])
				. '&fields=first_name,last_name,nickname,screen_name,sex,bdate,photo_big&access_token=' . urlencode($_token['access_token'])
			);
		if (!$profile || !($profile = json_decode($profile)) || isset($profile->error) || !isset($profile->response[0])) {
			throw new \Exception('Не удалось получить профайл');
		}
		$profile = $profile->response[0];
		/*
		if (isset($profile->bdate)) {
			$tmp = explode('.', $profile->bdate);
			if (count($tmp) != 3)
				$profile->bdate = '';
			else
				$profile->bdate = $tmp[2] . '-' . $tmp[1] . '-' . $tmp[0];
		} else {
			$profile->bdate = '';
		}

		$this->profile = array(
			'id' => $profile->uid
			, 'first_name' => isset($profile->first_name) ? trim($profile->first_name) : ''
			, 'last_name' => isset($profile->last_name) ? trim($profile->last_name) : ''
			//todo проверить возможность получения ника в FB, если он существует вообще
			, 'nick' => isset($profile->nickname) ? $profile->nickname : ''
			, 'sex' => isset($profile->sex) ? ($profile->sex == 1 ? 2 : 1) : 0
			, 'email' => isset($profile->email) ? $profile->email : ''
			, 'bdate' => isset($profile->bdate) ? $profile->bdate : ''
			, 'imageUrl' => isset($profile->photo_big) ? $profile->photo_big : false	
		);
		 */
		return $profile;
    }

}

