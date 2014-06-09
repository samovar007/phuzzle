<?php
spl_autoload_register (function ($_className) {
	$_className = ltrim($_className, '\\');
	if (!($lastNsPos = strripos($_className, '\\'))) {
		return false;
	}
	$namespace = substr($_className, 0, $lastNsPos);
    $fileName  = __DIR__ .  DIRECTORY_SEPARATOR 
		. str_replace('\\', DIRECTORY_SEPARATOR, $namespace) . DIRECTORY_SEPARATOR 
		. substr($_className, $lastNsPos + 1) . '.php';
	if (!include($fileName)) {
		throw new \Exception('Не найден класс ' . $_className);
	}
	return true;
});

require_once __DIR__ .  DIRECTORY_SEPARATOR . 'utils.php';