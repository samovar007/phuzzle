<?php
namespace Dml;
/**
 *
 * @author vsamoylov
 */
class Dml {
	static private $instance;
	/**
	 * Организация синглетона
	 * @return \Dml\Dml
	 */
	static public function getInstance() {
		if (!self::$instance) {
			self::$instance = new Dml;
		}
		return self::$instance;
	}
	
	private $debugConsoleLogger;
	/**
	 * Возвращает подходящий логер (зависит от режима отладки и от режима CLI)
	 * @return \Dml\FakeLogger
	 */
	public function getDebugConsoleLogger() {
		if (!$this->debugConsoleLogger) {
			if (DML_DEBUG_MODE) {
				if (DML_CLI) {
					$transport = new TransportLoggerConsole;
				} else {
					$transport = new TransportLoggerHtml;
					echo inTag(TransportLoggerHtml::getStyles(), 'style');
				}
				$this->debugConsoleLogger = new Logger($transport);
			} else {
				$this->debugConsoleLogger = new Fake;
			}
			
		}
		return $this->debugConsoleLogger;
	}
	/**
	 * Возвращает файллогер
	 * @todo: не хорошо, что с одним файлом тут можно создавать несколько логеров
	 * @param string $_filename
	 * @return \Dml\Logger
	 */
	public function getFileLogger($_filename) {
		return new Logger(TransportLoggerFile::getInstance($_filename));
	}
	public function setErrorHandlers($_setAllErrors = false, $_setDisplayErrors = false) {
		if ($_setAllErrors) {
			error_reporting(E_ALL);	
		}	
		if ($_setDisplayErrors) {
			ini_set('display_errors', 'stderr'); //надо бы проверить
			ini_set('display_startup_errors', 1);
		}
		
		//регистрируем обычный обработчик, но он ловит не все ошибки
		set_error_handler(array($this, 'errorHandler'));
		//через этот обработчик будем ловить фатальные ошибки
		register_shutdown_function(array($this, 'shutdownErrorHandler'));
	}
	/**
	 * Обработчик ошибки. Должна быть публичной, т.к. передается в set_error_handler
	 * @param int $_errno
	 * @param string $_errstr
	 * @param string $_errfile
	 * @param int $_errline
	 * @return boolean
	 */
	public function errorHandler($_errno, $_errstr, $_errfile, $_errline) {
		if (!(\error_reporting() & $_errno)) {
			return true; //ошибка не включена в error_reporting
		}
		$this->getDebugConsoleLogger()->error('type ' . $_errno . ':' . $_errstr . ' in ' . $_errfile . ': ' . $_errline);
		return true;	///Если false, то сработает встроенный обработчик
	}
	public function shutdownErrorHandler() {
		$lastErr = error_get_last();
		if ($lastErr["type"] == E_ERROR) {
			$this->getDebugConsoleLogger()->error($lastErr['message'] . ' in ' . $lastErr['file'] . ': ' . $lastErr['line'], true);
		}
	}
}

