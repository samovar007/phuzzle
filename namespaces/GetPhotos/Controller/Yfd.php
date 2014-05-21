<?php
namespace GetPhotos\Controller;
/**
 * Яндекс "фото дня"
 * @author vsamoylov
 */
class Yfd  extends \Common\Controller {
	public function indexAction() {
		return \Common\Templater::render('yfdView.html');
	}
}

