<?php
namespace Common\Social;
/**
 *
 * @author vsamoylov
 */
abstract class AbModel {
	/**
	 * Здесь храним подготовленные данные, полученные об юзере от провайдера,
	 * @var array
	 */
	protected $profile;	
	/**
	 * Параметры коннекта к соцсети
	 * @var array
	 */
	protected $provider;
	
	public function __construct($_params) {
		foreach (array('clientId', 'secretKey', 'retpath') as $f) {
			if (!isset($_params[$f])) {
				throw new \Exception('Отсутствует обязательный параметр ' . $f);
			}
			$this->provider = $_params;
		}
	}
	/**
	 * Возвращает УРЛ для авторизации через соцсеть (1 шаг)
	 * На него надо делать редирект
	 * @param string $_scope - какие данные может запрашивать приложение
	 * @param string $_retpath куда редиректит соцсеть 
	 * @return string УРЛ для редиректа
	 */
	abstract protected function getOauthUrl($_scope = '');
	/**
	 * Выполняет первый шаг авторизации (редирект на соцсеть с заданными параметрами)
	 */
	public function step1($_scope = '') {
		\Utils\redirect($this->getOauthUrl($_scope));
	}		
	/**
	 * Разбор параметров, возвращенных в урл из соцсети на первом шаге
	 * @return string
	 * @throws Exception
	 */
	protected function getCallbackParams() {
		if (!isset($_GET['code'])) {
			throw new \Exception('Параметр code не найден. ' . (isset($_GET['error']) ? $_GET['error'] : ''));
		}
		return $_GET['code'];
	}
	/**
	 * Возвращает токен (второй шаг авторизации)
	 */
	abstract public function getToken();
	
	/**
	 * Возвращает профиль пользователя
	 */
	abstract public function getProfile($_token);
	

}

