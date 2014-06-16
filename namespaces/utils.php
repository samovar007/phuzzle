<?php

namespace Utils;

/**
 * осуществляет простой редирект на страницу
 * @param string $_url
 */
function redirect($_url) {
	header('Location: ' . $_url);
	exit;
}
/**
 * Получаем инфу через curl
 * @param string $_url
 * @return string
 * @throws Exception
 */
function getByCurl($_url, $_postFields = '', array $_optAr = array()) {
	$curl = curl_init();
	curl_setopt($curl, CURLOPT_URL, $_url);
	$optAr = array(
		CURLOPT_VERBOSE => 0
		, CURLOPT_RETURNTRANSFER => 1
		, CURLOPT_TIMEOUT => 5
		, CURLOPT_HEADER => 0
		);
	if (defined('CFG_CURL_PROXY')) {
		$optAr[CURLOPT_PROXY] = CFG_CURL_PROXY;
	}
	if ($_postFields) {
		$optAr[CURLOPT_POST] = 1;
		$optAr[CURLOPT_POSTFIELDS] = $_postFields;
	}
	foreach ($_optAr as $k=>$v) {
		$optAr[$k] = $v;
	}
	curl_setopt_array($curl, $optAr);
	$content = curl_exec($curl);
	$error = curl_error($curl);
	curl_close($curl);
	if ($error) {
		throw new Exception ('curl error: ' . $error);
	}
	return $content;
}
/** 
  * Генератор паролей.
  * Создает случайный набор символов латинского алфавита и цифр заданной длинны
  * @param int $_length
  * @return string
  */
function passwordGenerator($_length) {
	$password = ''; 
	while ($_length--) {
		$ch = rand(48, 109);
		if ($ch > 57) {
			$ch += 7;   //пропуск значков
		}   
		if ($ch > 90) {
			$ch += 6;   //пропуск других значков
		}   
		$password .= chr($ch);
	}   
	return $password;
}   



