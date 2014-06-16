<?php
/* 
 * формирует страницу, которая сразу же редиректит на пазл
 * Нужна для корректного шаринга в соцсетях (чтоб картинка отображалась
 */

$img = isset($_GET['img']) ? preg_replace('/[^-a-zA-Z0-9\._:&=\?\/]+/', '', $_GET['img']) : '';
$complexity = isset($_GET['complexity']) ? (int)$_GET['complexity'] : 1;
$url = 'http://' . $_SERVER['HTTP_HOST'] . '/?' . $_SERVER['QUERY_STRING'];
$thisUrl = 'http://'. $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
?>
<!DOCTYPE html>
<html><head>
<title>Фазлы - фотопазлы</title>

<meta name="description" content="Пазл из любого изображения. Делитесь ссылками на свои пазлы в соцсетях. Подходит как взрослым, так и детям. Есть минутка - фазлы!">
<meta name="keywords" content="Пазлы, развлечения, фото, фотопазлы, фазлы">
<meta name='viewport' content='width=device-width, initial-scale=1.0, user-scalable=no'>

<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

<link rel="icon" href="/favicon.png">
<link rel="shortcut icon" href="/favicon.png">
<link rel="apple-touch-icon" href="/favicon32.png"> 
<link href='/skin/style.css' rel='stylesheet' type='text/css'>

<meta property="og:site_name" content="Фазлы - фотопазлы">
<meta property="og:title" content="Пазл из фото">
<meta property="og:image" content="<?= $img?>">
<meta property="og:url" content="<?= addslashes($thisUrl)?>">
<meta property="og:description" content="">
<script>
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	ga('create', 'UA-51202174-1', 'phuzzle.ru');
	ga('send', 'pageview');
	
	location.href='<?=addslashes($url)?>';
</script>	
</head><body>
</body></html>	


