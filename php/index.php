<?php
require_once('Init.php');
if(isset($_GET['logout'])){
	$Account->logout();
	die('<script>location="?";</script>');
}else if($Account->login()){
	if(isset($_GET['changeNickname'])){
		$Account->changeNickname();
	}
	include(INTERFACE_PATH . 'p1Header.php');
// load all script here
	loadRes('common');
	loadRes('game');
	include(INTERFACE_PATH . 'p2Header.php');
	loadInterface('game');
	if($Account->getStatus()){
		//logined 
//		include(INTERFACE_PATH . 'account/welcome.php');
		callLayer('modeSelect');
	}else{
		// ask user name
//		include(INTERFACE_PATH . 'account/missName.php');
		callLayer('changeNickname');
	}
//	include(INTERFACE_PATH . 'account/footer.php');
	include(INTERFACE_PATH . 'footer.php');
}else{
	include(INTERFACE_PATH . 'p1Header.php');
// load all script here
	loadRes('common');
	loadRes('account');
  include(INTERFACE_PATH . 'p2Header.php');
	loadInterface('account');
	callLayer('login');
	// show google or facebook login link
//	include(INTERFACE_PATH . 'account/header.php');
//	include(INTERFACE_PATH . 'eHeader.php');
//	include(INTERFACE_PATH . 'account/login.php');
	include(INTERFACE_PATH . 'footer.php');
}