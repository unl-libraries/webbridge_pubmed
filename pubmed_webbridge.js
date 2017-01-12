/*Javascript code to lookup the DOI from a pubmed record
	authored by Stacy Rickel - Dec. 2016
*/

/* declare the location of the PHP record_lookup.php so this script can find it.  Whereever you can run PHP from.
 *  Include the trailing slash here if needed. We placed this javascript file in the same place as the PHP file
 *  example:  http://yoursevername/pubmed/
 */

	var PHP_FILE_LOC=""

/* define the URL of your library proxy url - This is for Sierra Webbridge, so 
 * a proxy url is usually of the format http://0-somevendordomain.yourlibrarydomain/restof the vendor url

 */
	var LIBRARY_PROXY_URL=""
	
/* the pid is the your institutional id with crossref */
	var pid=""

/*
 * The OpenURL request url that we will send parameters to and create a Request item link
 * 
 */
	var requestOpenURL = "";

/* First step -  grab the parameters from the url and parse them */

/**
 * getParameterByName
 * 
 * function to return the value of an argument in the URL query
 */
function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * getCitation Parses out the citation information from the pubmed medatadata
 * @param record_metadata Metadata on the pubmed article as retrieved from their service
 * @returns {String} Containing the text of the citationn to be included.  Formatting can be altered here
 */
function getCitation(record_metadata){
	var citation_info='';
	//the variables here are named as closely to what webbridge normally sees to make it easeir to identify and make changes
	atitle = record_metadata.title;
	authors = record_metadata.authors;
	aufirst = authors[0].name;
	aulast = record_metadata.lastauthor;
	title = record_metadata.fulljournalname;
	volume = record_metadata.volume;
	issue = record_metadata.issue;
	pages = record_metadata.pages;
	date = record_metadata.pubdate;
	
	if(atitle){citation_info +='<span class="citationtitle">'+atitle+'</span><br >'};
	if (aulast){
		citation_info +='Author: '+aulast;
		if (aufirst){citation_info += ', ' + aufirst;}
		citation_info += '.&nbsp;';
	}	
	if (title){
		citation_info += 'Published in: '+title+',&nbsp;';
	}
	else if(record_metadata.source){
		citation_info += 'Published in: '+record_metadata.source+',';
	}
	if (volume){
		citation_info += 'v.'+volume+'&nbsp;';
	}
	if (issue){
		citation_info +='no.'+issue+',';
	} 
	if(pages){
		citation_info +='pp.'+pages;
	}
	if (date){
		citation_info +='&nbsp;Date: '+date;
	}
	return citation_info;
}

function getRequestLink(record_metadata){
	if (record_metadata.pubtype[0] != "Journal Article"){
		return requestOpenURL+"?sid=PubMed&genre=thesis&" +
				"aulast=" +	encodeURIComponent(record_metadata.lastauthor) + 
				"&aufirst=" + encodeURIComponent(record_metadata.authors[0].name) + 
				"&title=" +	encodeURIComponent(record_metadata.booktitle) + 
				"&date=#year2#" +
				"&pub=#@school#" +
				"&CallNumber=#@CallNumber#" +
				"&callnum=#@CALLNUM#" +
				"&Call-Number=#@CALL-NUMBER#" +
				"&callnumber=#@CALLNUMBER090#";
	}
	else {
		return requestOpenURL+"?sid=PubMed&genre=article" +
				"&issn=" +encodeURIComponent(record_metadata.issn) +
				"&aulast=" + encodeURIComponent(record_metadata.lastauthor) +
				"&aufirst=" +encodeURIComponent(record_metadata.authors[0].name) +
				"&atitle=" +encodeURIComponent(record_metadata.title) +
				"&issue=" +encodeURIComponent(record_metadata.issue) + 
				"&title=" + encodeURIComponent(record_metadata.fulljournalname) + 
				"&spage=" +
				"&epage=" +
				"&volume=" +encodeURIComponent(record_metadata.volume) +
				"&date=" +encodeURIComponent(record_metadata.pubdate) +
				"&PhotoArticleTitle=" + encodeURIComponent(record_metadata.title) +
				"&PhotoJournalVolume=" + encodeURIComponent(record_metadata.volume)+
				"&PhotoJournalIssue=" + encodeURIComponent(record_metadata.issue) +
				"&PhotoJournalYear=" +
				"&PhotoJournalInclusivePages=" + encodeURIComponent(record_metadata.pages) +
				"&PhotoJournalMonth=" +
				"&LoanAuthor=";
	}
}


/**
 * The triggered function that sends the request to the PHP script that performs the lookup with the service and 
 * returns json with a callback to not have the cross-site issues
 * 
 */
function updatePubmed(){
	var sid=getParameterByName('sid');
	//if sid=Entrez:PubMed, then get the pubmed id from id=pmid:27935557 OR pmid=27935557
	if (sid=='Entrez:PubMed'){
		var pmid=getParameterByName('pmid');
		if (!pmid) {
			pmid=getParameterByName('id');
			//strip the 'pmid:'
			pmid=pmid.replace("pmid:","");
		}
		if (pmid){
				$.getJSON(PHP_FILE_LOC+'record_lookup.php?pmid='+pmid+'&callback=?',function( record){
						if (record.result[pmid]){
							record_metadata = record.result[pmid];
							
							//parse out the citation information, as that appears to be missing from this also
							citation = getCitation(record_metadata);
							//all items are written to the div with the id="pubmed_crossref" that was added to the resserv_panel.html file
							if (citation) {$("#pubmed_crossref")[0].innerHTML += citation;}
							
							//parse out the article id information - we are looking for the doi
							articleids = record_metadata.articleids;
							$.each(articleids, function (i,item){
								if (item.idtype=='doi'){
									doi = item.value;
								}
							});
							if (typeof doi === "undefined") {
								//found article result, but no DOI
								var match = /^doi\:\s+(.+)/i.exec(record_metadata.elocationid); 
								if (typeof match[1] != undefined){
									doi = match[1];
									$("#pubmed_crossref")[0].innerHTML += "<p><a href='http://0-www.crossref.org."+LIBRARY_PROXY_URL+"/openurl?pid="+pid+"&id=doi:"+doi+"'>Get Full Text through Crossref</a></p>";
								}
								else {
									$("#pubmed_crossref")[0].innerHTML += "<p><span style='color:red;padding:2px;'>Could not find DOI for this record</span></p>";								 
								}
							}
							else{
								$("#pubmed_crossref")[0].innerHTML += "<p><a href='http://0-www.crossref.org."+LIBRARY_PROXY_URL+"/openurl?pid="+pid+"&id=doi:"+doi+"'>Get Full Text through Crossref</a></p>";
							}
							$("#pubmed_crossref")[0].innerHTML += "<a href='"+getRequestLink(record_metadata)+"'>Request Delivery</a>";
						}
						else { $("#pubmed_crossref")[0].innerHTML +="<p><span style='color:red;padding:2px;'>DOI for article "+pmid+" could not be found</span></p>"; }
			});
						
						
		}// end of if (pmid)
	} //end of if sid=Entrez:PubMed
}
