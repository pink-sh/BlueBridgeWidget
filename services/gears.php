<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Content-Type: application/json');
$q = htmlspecialchars($_GET["q"]);

$in = array (
	array(
		'id' => 'NULL',
		'value' => 'NULL',
		'label' => 'NONE'
	),
	array(
		'id' => 'BB',
		'value' => 'BB',
		'label' => 'Baitboat'
	),
	array(
		'id' => 'LL',
		'value' => 'LL',
		'label' => 'Longline'
	),
	array(
		'id' => 'OTHER',
		'value' => 'OTHER',
		'label' => 'Other'
	),
	array(
		'id' => 'PS',
		'value' => 'PS',
		'label' => 'Purse seine'
	),
);

$out = array();
if ($q == null || trim($q) == '') {
	print(json_encode($in));
} else {
	foreach ($in as $obj) {
	    if (strpos(strtolower($obj['label']), strtolower($q)) !== false) {
		    array_push($out, $obj);
		}
	}
	print(json_encode($out));
}


?>