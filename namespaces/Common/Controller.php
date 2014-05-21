<?php
namespace Common;
/**
 * Родитель для контроллеров + фабричный метод
 * @author vsamoylov
 */
class Controller {
	
	static protected $parsedUri = array();
	
	static protected function getNextParam($_default) {
		if (isset(self::$parsedUri[0])) {
			$ret = array_shift(self::$parsedUri);
		} else {
			$ret = $_default;
		}
		return $ret;
	} 
	
	static public function factory($_projectName, $_uri, $_defaultControllerName) {
		$_projectName = ucfirst($_projectName);
		//Разбираем URL
		$parsed = explode('?', $_SERVER['REQUEST_URI']);
		$parsed = explode('/', trim($parsed[0], " \t\n\r\0\/"));
		if (ucfirst($parsed[0]) == $_projectName) {
			array_shift($parsed);//Если проект зашит в УРЛ, но он может быть и не зашит
		}
		self::$parsedUri = $parsed;
		$controllerName = self::getNextParam($_defaultControllerName);
		
		$className = '\\' . $_projectName . '\\Controller\\' . ucfirst($controllerName);
		return new $className;
	}
	
	protected $default = 'index';
	
	public function doit() {
		$method = self::getNextParam($this->default) . 'Action';
		if (!method_exists($this, $method)) {
			throw new \Exception('Вызов ошибочного метода ' . $method);
		}
		return $this->{$method}();
	}

}

