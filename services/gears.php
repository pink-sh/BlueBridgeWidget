<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Content-Type: application/json');
$q = htmlspecialchars($_GET["q"]);

$conn = pg_connect("host=db-tuna.d4science.org port=5432 dbname=sardara_world user=invsardara password=fle087");

if ($q != null && $q != "") {
	$where1 = "where LOWER(gear_labels.english_name_gear) ILIKE '%".strtolower($q)."%'";
	$where2 = "where LOWER(geargroupcode) ILIKE '%".strtolower($q)."%'";
} else {
	$where1 = "";
	$where2 = "";
}

$query = "(select distinct " .
"gear_labels.english_name_gear AS value, " .
"gear_labels.english_name_gear AS label " .
"from tunaatlas.catches_ird_rf1 " .
"JOIN gear.gear_labels ON catches_ird_rf1.id_geargroup_standard=gear_labels.id_gear ".$where1.")  " .
"UNION " .
"(select distinct " .
"geargroupcode AS value, " .
"len_geargroup AS label " .
"from gear.geargroup_tunaaltas ".$where2.") " .
"order by label";

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
