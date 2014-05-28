<?php
namespace GetPhotos\Controller;

/**
 * Работа с fb
 * Здесь пробуем обойтись только js
 *
 * @author vsamoylov
 */
class Fb extends \Common\Controller {
	protected function indexAction() {
		return \Common\Templater::render('fbView.html');
	}
}	

