<?php
/* 
 * формирует страницу, которая сразу же редиректит на пазл
 * Нужна для корректного шаринга в соцсетях (чтоб картинка отображалась
 */

$img = isset($_GET['img']) ? addslashes($_GET['img']) : '';
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
	location.href='<?=addslashes($url)?>';
</script>	
</head><body>
	<img src="<?=$img ?>">
</body></html>	


