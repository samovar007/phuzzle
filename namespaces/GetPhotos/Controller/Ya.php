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
		return \Common\Templater::render('yaView.html'
				, array('masterUrl' => $this->model->getFotkiServiceDocumentUrl($_authParams['token']))
			);
	}
	
//	protected function jsonAction() {
//		$data = $this->getSessionData();
//		if (!isset($data['token'], $data['token']['access_token'])) {
//			echo '[]';
//			exit;
//		}
//		switch (self::getNextParam('')) {
//			case 'feed':
//				echo \Utils\getByCurl('https://api.instagram.com/v1/users/self/feed?access_token=' . $data['token']['access_token']);
//				break;
//			default: 
//				echo \Utils\getByCurl('https://api.instagram.com/v1/media/popular?access_token=' . $data['token']['access_token']);
//				break;
//		}
//		exit;
//	}
	
}

