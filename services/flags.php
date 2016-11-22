<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Content-Type: application/json');
$q = htmlspecialchars($_GET["q"]);

$conn = pg_connect("host=db-tuna.d4science.org port=5432 dbname=sardara_world user=invsardara password=fle087");

if ($q != null && $q != "") {
	$where1 = "where flag ILIKE '%".$q."%'";
	$where2 = "where flagname ILIKE '%".$q."%'";
	$where3 = "where fleet ILIKE '%".$q."%'";
} else {
	$where1 = "";
	$where2 = "";
	$where3 = "";
}

$query = "(SELECT codigo_code AS value, flag as label " .
"FROM flag.flag_iattc ".$where1.") " .
"UNION " .
"(SELECT flagcode AS value, flagname as label " .
"FROM flag.flag_iccat ".$where2.") " .
"UNION " .
"(SELECT flcde AS value, fleet as label " .
"FROM flag.flag_iotc ".$where3.") " .
"ORDER BY label;";
$result = pg_query($conn, $query);
$out = array();
while ($row = pg_fetch_row($result)) {
	$o['label'] = $row[1];
	$o['value'] = $row[0];
	$o['id'] = $row[0];
	array_push($out, $o);
}
print(json_encode($out));
?>