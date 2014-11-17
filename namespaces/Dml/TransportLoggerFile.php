<?php
namespace Dml;
/**
 * Транспорт для записи в файл
 * @author vsamoylov
 */
class TransportLoggerFile extends TransportLoggerAbstract {
	
	static private $instances = array();
	static public function getInstance($_filename) {
		if (!self::$instances[$_filename]) {
			self::$instances[$_filename] = new TransportLoggerFile($_filename);
		}
		return self::$instances[$_filename];
	}
	private $fp;
	private function __construct($_filename) {
		$this->fp = \fopen($_filename, 'a+');
	}
	public function __destruct() {
		\fclose($this->fp);
	}
	public function write($_str) {
		\fwrite($this->fp, $_str . "\n");
	}
}	
