<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Content-Type: application/json');
$q = htmlspecialchars($_GET["q"]);

$conn = pg_connect("host=db-tuna.d4science.org port=5432 dbname=sardara_world user=invsardara password=fle087");

if ($q != null && $q != "") {
	$where = "where LOWER(species_labels.english_name_species) ILIKE '%".strtolower($q)."%'";
} else {
	$where = "";
}

$query = "(select distinct " .
"species_labels.codesource_species AS value, " .
"species_labels.english_name_species AS label " .
"from tunaatlas.catches_ird_rf1 " .
"JOIN species.species_labels ON catches_ird_rf1.id_species_standard=species_labels.id_species ".$where.") " .
"UNION " .
"(select distinct " .
"species_labels.codesource_species AS value, " .
"species_labels.english_name_species AS label " .
"from tunaatlas.catches_ird_rf1 " .
"JOIN species.species_labels ON catches_ird_rf1.id_speciesgroup_tunaatlas=species_labels.id_species ".$where.") order by label";
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
