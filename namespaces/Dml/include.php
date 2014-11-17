<?php
/**
 * Несколько отдельных функций для иницилизации минилибы
 * @author vsamoylov
 */
namespace Dml;

define('DML_DIR', __DIR__);
define('DML_NAMESPACE', __NAMESPACE__);
define('DML_CLI', isset($_SERVER['argc']));

if (DML_CLI) {
	define('BR', "\n");
	define('TAB', "\t");
	define('NBSP', " " );
} else {
	define('BR', "<br>\n");
	define('NBSP', "&nbsp;");
	define('TAB', NBSP.NBSP.NBSP.NBSP);
}
/**
 * Определяем, работаем ли мы в режиме отладки по переменной окружения или по куке
 * Для установки в html ставим куку, а в CLI запускаем коммандой 
 * > DML_DEBUG_MODE=y php <путь до скрипта>
 */
define ('DML_DEBUG_MODE'
	, (isset($_COOKIE, $_COOKIE['DML_DEBUG_MODE']) && 'y' == $_COOKIE['DML_DEBUG_MODE']) 
		|| ('y' == getenv('DML_DEBUG_MODE'))
	);

/**
 * Автоподключение классов Dml
 */
\spl_autoload_register (function ($_className) {
	$_className = ltrim($_className, '\\');
	if (!($lastNsPos = strripos($_className, '\\'))) {
		return false;
	}
	$namespace = substr($_className, 0, $lastNsPos);
	if (DML_NAMESPACE == $namespace) {
		$fileName  = DML_DIR . DIRECTORY_SEPARATOR . substr($_className, $lastNsPos + 1) . '.php';
	} else {
		return false;
	}
	return include($fileName);
});
/**
 * Вызывает бектрейс и преобразует его в строку для вывода
 * @return string
 */
function backtrace() {
	$trace = debug_backtrace();
	$str = '';
	foreach ($trace as $r) {
		$str .= BR . "\t" . (isset($r['file']) ? $r['file'] : '-') . ':' . (isset($r['line']) ? $r['line'] : '-');
	}
	return $str;
}
/**
 * Отдает html строку в теге
 * @param string $_str - помещаемая в тег строка
 * @param string $_tag - тег
 * @param string $_addition - не обязательная строка доп. атрибутов в теге
 * @return string
 */
function inTag($_str, $_tag) {
	return '<' . $_tag . '>' . $_str . '</' . $_tag . '>';
}


return  \Dml\Dml::getInstance();