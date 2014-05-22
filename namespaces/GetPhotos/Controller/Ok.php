<?php
namespace GetPhotos\Controller;
/**
 *
 * @author vsamoylov
 */
class Ok extends SocialAuth {
	protected $name = 'ok';
	
	protected function createModel($_params) {
		return new \Common\Social\Ok($_params);
	}
	
	protected function getPhotos($_authParams) {
		return \Common\Templater::render('okView.html');
		//var_dump($_authParams);
		//exit;
	}
	protected function jsonAction() {
		$data = $this->getSessionData();
		if (!isset($data['profile'])) {
			echo '[]';
			exit;
		}
		switch (self::getNextParam('')) {
			case 'albums':
				echo $this->model->getAlbumsJson($data['profile']);
				break;
			default: 
				echo $this->model->getPhotosJson($data['profile'], isset($_GET['aid']) ? $_GET['aid'] : 0);
				break;
		}
		exit;
	}
}

