<?php
namespace GetPhotos\Controller;
/**
 *
 * @author vsamoylov
 */
abstract class SocialAuth extends \Common\Controller {
	
	protected $default = 'auth';
	/**
	 * Здесь храним подготовленные данные, полученные об юзере от провайдера,
	 * @var array
	 */
	protected $profile;	
	
	abstract protected function getOauthUrl();
	/**
	 * Запускаем процесс авторизации через соцсеть
	 */
	protected function authAction() {
		\Utils\redirect($this->getOauthUrl());
	}
	
	protected function callbackAction() {
		$profile = $this->getProfile();
		//Array ( [login] => 100001802922898 [nick] => Василий Самойлов [email] => sam_vm@mail.ru ) 
		//надо проверить, есть ли такой юзер. 
		//Если есть, то переходим под него, иначе - запоминаем в сессии и переходим на регистрацию
		$profile['login'] .=  '@' . $this->provider['name'];
/*
Так получаем альбомы:
https://api.vk.com/method/photos.getAlbums?owner_id=76700449&need_system=1&need_covers=1&callback=myfunc
Так получаем фоты из альбомов
https://api.vk.com/method/photos.get?owner_id=76700449&album_id=107587158&callback=myfunc
 */		
		var_dump($profile);
		
	}
	
	/**
	 * Возвращает подготовленный параметр retpath для передачи провайдеру
	 * @return string
	 */
	protected function getRetpathForProvider() {
		return 'http://' . $_SERVER['HTTP_HOST']. DIRECTORY_SEPARATOR 
			. \GetPhotos\Config::PROJECT_NAME . DIRECTORY_SEPARATOR
			. $this->provider['name'] . '/callback';
	}
	/**
	 * Вспомогательная - обращение через иницилизированный curl для получения ответа в формате json
	 * @param type $_curl
	 * @return type
	 * @throws Exception
	 */
	/*
	protected function getJsonFromCurl($_curl) {
		curl_setopt($_curl, CURLOPT_RETURNTRANSFER, 1);
		$result = curl_exec($_curl);
		$error = curl_error($_curl);
		curl_close($_curl);
		if ($error) {
			throw new Exception(__METHOD__ . ' curl error: ' . $error);
		}
		$json = @json_decode($result);
		if (!$json) {
			throw new Exception(__METHOD__ . ' curl return not json: ' . $result);
		}
		return $json;
	}
	*/
	abstract protected function getProfile();
	
}

