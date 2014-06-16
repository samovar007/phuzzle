<?php
namespace GetPhotos\Controller;

/**
 * Работа с яндексом
 * @author vsamoylov
 */
class Ya  extends SocialAuth {
	
	protected $name = 'ya';
	
	protected function createModel($_params) {
		return new \Common\Social\Ya($_params);
	}
	
	protected function getPhotos($_authParams) {
		try {
			return \Common\Templater::render('yaView.html'
				, array('masterUrl' => $this->model->getFotkiServiceDocumentUrl($_authParams['token']))
				);
		} catch (\Common\UserException $e) {
			return $e->getMessage();
		}	
	}
}

