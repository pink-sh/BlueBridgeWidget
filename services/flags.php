<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Content-Type: application/json');
$q = htmlspecialchars($_GET["q"]);

$conn = pg_connect("host=db-tuna.d4science.org port=5432 dbname=sardara_world user=invsardara password=fle087");

if ($q != null && $q != "") {
	$where = " where LOWER(flag_labels.english_name_flag) ILIKE '%".strtolower($q)."%'";
} else {
	$where = "";
}

$query = "select distinct " .
"flag_labels.codesource_flag AS value, " .
"flag_labels.english_name_flag AS label " .
"from tunaatlas.catches_ird_rf1 " .
"JOIN flag.flag_labels ON catches_ird_rf1.id_flag_standard=flag_labels.id_flag " . $where . " order by flag_labels.english_name_flag";
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
