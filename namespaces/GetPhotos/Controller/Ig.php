<?php
namespace GetPhotos\Controller;

/**
 * Работа с инстаграм
 * @author vsamoylov
 */
class Ig  extends SocialAuth {
	
	protected $name = 'ig';
	
	protected function createModel($_params) {
		return new \Common\Social\Ig($_params);
	}
	
	protected function getPhotos($_authParams) {
		return \Common\Templater::render('igView.html');
	}
	
	protected function jsonAction() {
		$data = $this->getSessionData();
		if (!isset($data['token'], $data['token']['access_token'])) {
			echo '[]';
			exit;
		}
		switch (self::getNextParam('')) {
			case 'feed':
				echo \Utils\getByCurl('https://api.instagram.com/v1/users/self/feed?access_token=' . $data['token']['access_token']);
				break;
			default: 
				echo \Utils\getByCurl('https://api.instagram.com/v1/media/popular?access_token=' . $data['token']['access_token']);
				break;
		}
		//https://api.instagram.com/v1/users/self/feed?access_token=1381108398.f59def8.a0308d2701a348a5bf1ca161111ccef1

		
		exit;
	}
	
}

