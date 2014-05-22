<?php
namespace GetPhotos\Controller;

/**
 * Работа с vk
 *
 * @author vsamoylov
 */
class Vk extends SocialAuth {
	
	protected $name = 'vk';
	
	protected function createModel($_params) {
		return new \Common\Social\Vk($_params);
	}
	
	protected function getPhotos($_authParams) {
		return \Common\Templater::render('vkView.html', array('uid'=>$_authParams['profile']->uid));
	}
}	
