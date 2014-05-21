<?php
namespace GetPhotos\Controller;
/**
 *
 * @author vsamoylov
 */
class Index extends \Common\Controller {
	public function indexAction() {
		return \Common\Templater::render('indexView.html');
	}
}

