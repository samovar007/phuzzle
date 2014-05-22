<?php
define('BR', "\n");
define('PROJECT_ROOT', realpath(__DIR__ . '/../../') . DIRECTORY_SEPARATOR);
define('PROJECT_NAME', 'getPhotos');
define('HTTP_PROJECT_BEGIN', 'http://' . $_SERVER['HTTP_HOST'] . '/' . PROJECT_NAME . '/');

require PROJECT_ROOT . 'namespaces/autoload.php';
require PROJECT_ROOT . 'config/Config.php';

try {
	//Иницилизация шаблонизатора
	\Common\Templater::setRoot(PROJECT_ROOT . 'templates' . DIRECTORY_SEPARATOR . PROJECT_NAME);

	$controller = \Common\Controller::factory(PROJECT_NAME, $_SERVER['REQUEST_URI'], 'Index');

	echo \Common\Templater::render('main.html'
		, array('content' => $controller->doit())
		);
} catch (\Exception $e) {
	echo error_log($e);
}	