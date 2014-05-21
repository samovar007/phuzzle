<?php
namespace Common;
/**
 *
 * @author vsamoylov
 */
class Templater {
	/**
	 * Корневой каталог для шаблонов	
	 * @var string
	 */	
	static private $root = null;
	
	static public function setRoot($_root) {
		if (DIRECTORY_SEPARATOR != $_root[strlen($_root-1)]) {
			$_root .= DIRECTORY_SEPARATOR;
		}
		if (!is_dir($_root)) {
			throw new \Exception($_root . ' is not a direcrory');
		}
		self::$root = $_root;
	}
	
	static public function render($_filename, $_params = array()) {
		if (!file_exists(self::$root . $_filename)) {
			throw new \Exception(self::$root . $_filename . ' not found');
		}
		ob_start();
		extract($_params);
		include  self::$root . $_filename;
		return ob_get_clean();
	}
}

