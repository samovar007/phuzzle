<?php
namespace GetPhotos\Controller;
/**
 *
 * @author vsamoylov
 */
abstract class SocialAuth extends \Common\Controller {

	/**
	 * Сюда потомки кладут название сети
	 * @var string
	 */
	protected $name;
	protected $model;
	
	/**
	 * Отдает фотографии для авторизованного пользователя
	 */
	abstract protected function getPhotos($_authParams);
	abstract protected function createModel($_params);
	
	function __construct() {
		$params = \Config::$providers[$this->name];
		$params['retpath'] = HTTP_PROJECT_BEGIN . $this->name . '/callback';
		$this->model = $this->createModel($params);
		session_start();
	}
	
	protected function indexAction() {
		//Проверяем, нет ли в сессии уже данных
		$varName = $this->getSessionVarName();
		if (isset($_SESSION[$varName]) && is_array($_SESSION[$varName]) && 0 < sizeof($_SESSION[$varName])) {
			return $this->getPhotos($_SESSION[$varName]);
		}
		$this->model->step1();
		//После этого идет редирект на соцсеть и сюда никто не приходит
		exit;
	}
	
	protected function callbackAction() {
		$varName = $this->getSessionVarName();
		$token = $this->model->getToken();
		$_SESSION[$varName]['token'] = $token;
		$profile = $this->model->getProfile($token);
		$_SESSION[$varName]['profile'] = $profile;
		\Utils\redirect(HTTP_PROJECT_BEGIN . $this->name . '/');
	}
	
	protected function logoutAction() {
		$this->clearSessionData();
		\Utils\redirect(HTTP_PROJECT_BEGIN);
	}

	protected function getSessionVarName() {
		return 'authBy'.$this->name;
	}

	protected function getSessionData() {
		$varName = $this->getSessionVarName();
		return isset($_SESSION[$varName]) ? $_SESSION[$varName] : array();
	}
	
	protected function clearSessionData() {
		$_SESSION[$this->getSessionVarName()] = array();
	}
}

