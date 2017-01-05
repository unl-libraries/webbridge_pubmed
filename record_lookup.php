<?php
/**
 * record_lookup.php
 * @author sricke1@unl.edu
 *  Jan 5 2017
 * @var $pmid should be the pmid value from the URL from pubmed to webbridge
 */
$pmid = (!empty($_GET['pmid'])?$_GET['pmid']:null);

if ($pmid){
	//grab the json from the service URL	
	$service_url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id='.$pmid.'&retmode=json';
	$json_result = file_get_contents($service_url);
	
	if (array_key_exists('callback',$_GET)){
		header('Content-Type: test/javascript; charset=utf8');
		header('Access-Control-Allow-Methods: GET');
		$callback = $_GET['callback'];
		echo $callback.'('.$json_result.');';
	}
	else{
		header('Content-Type: application/json; charset=utf8');
		echo $json_result;
	}
}
//do nothing if there is no pmid