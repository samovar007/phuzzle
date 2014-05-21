<?php
define('BR', "\n");
define('PROJECT_ROOT', realpath(__DIR__ . '/../../') . DIRECTORY_SEPARATOR);

require PROJECT_ROOT . 'namespaces/autoload.php';
use GetPhotos\Config as Config;	
try {
	//Иницилизация шаблонизатора
	\Common\Templater::setRoot(PROJECT_ROOT . 'templates' . DIRECTORY_SEPARATOR . Config::PROJECT_NAME);

	$controller = \Common\Controller::factory(Config::PROJECT_NAME, $_SERVER['REQUEST_URI'], 'Index');

	echo \Common\Templater::render('main.html'
		, array('content' => $controller->doit())
		);
} catch (\Exception $e) {
	echo error_log($e);
}	