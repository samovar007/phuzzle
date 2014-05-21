<?php
namespace GetPhotos\Controller;

/**
 * Работа с vk
 *
 * @author vsamoylov
 */
class Vk extends SocialAuth {
	
	
	/**
	 * Храним данные о токене соцсети
	 */
	private $token;

	protected $provider = array(
		'clientId' => 4370170
		, 'secretKey' => 'HbSUi9vgL0OHVZ6eiyl4'
		, 'name' => 'vk'
	);
	
	protected function getOauthUrl() {
        return 'http://oauth.vk.com/authorize?client_id='
            . urlencode($this->provider['clientId'])
            . '&redirect_uri=' . $this->getRetpathForProvider()
            . '&display=popup&response_type=code';
	}
    /**
     * Обращается к вк по токену и получает данные
     * @return mixed
     * @throws Exception
     */
    private function getToken() {
        if (is_null($this->token)) {
            if (!isset($_GET['code'])) {
                throw new Exception('Параметр code не найден');
            }
            $code = $_GET['code'];

            $token = \Utils\getByCurl('https://oauth.vk.com/access_token?client_id='
                . urlencode($this->provider['clientId']).'&client_secret='
                . urlencode($this->provider['secretKey']).'&code='
                . urlencode($code).'&redirect_uri='
                . urlencode($this->getRetpathForProvider())
                );
            if (!$token) {
                throw new \Exception('Не удалось получить токен');
            }

            $this->token = json_decode($token, true);
            if (empty($this->token['user_id'])) {
                throw new \Exception('Не удалось получить корректный токен');
            }
        }
        return $this->token;
    }

	private function _getProfile() {
        if (is_null($this->profile)) {
            $this->getToken();

            $profile = \Utils\getByCurl('https://api.vk.com/method/getProfiles?uid='.urlencode($this->token['user_id']).'&fields=first_name,last_name,nickname,screen_name,sex,bdate,photo_big&access_token='.urlencode($this->token['access_token']));
            if (!$profile || !($profile = json_decode($profile)) || isset($profile->error) || !isset($profile->response[0])) {
                throw new \Exception('Не удалось получить профайл');
            }
            $profile = $profile->response[0];
			
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
        }
        return $this->profile;
    }

    /**
     * получение подготовленного профайла
     */
    protected function getProfile() {
        $profile = $this->_getProfile();
        $nick = !empty($profile['nick']) ? $profile['nick']
                : trim((isset($profile['first_name']) ? $profile['first_name'] : '')
                    .(isset($profile['last_name']) ? ' ' . $profile['last_name'] : ''));
		return array
			( 'login' => $profile['id']
			, 'nick' => $nick
			, 'email' => $profile['email']
			);
    }
}	