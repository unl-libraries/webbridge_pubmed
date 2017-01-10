# Webbridge Pubmed workaround

A workaround for an issue with links from pubmed articles back to the Innovative Sierra webbridge resolver.  
PHP and Javascript files make a call to a pubmed service that looks up the metadata on the article and returns
the DOI for a link to Crossref.  The citation information is also reconstructed.

You will need a publicly accessible spot to serve up javascript and PHP files, and access to your Sierra WebMaster files
to edit the webbridge page.

##Usage:

1. You will need a place to run PHP scripts from that will be publicly accessible.  
Place the `record_lookup.php` and the `pubmed_webbridge.js` and a copy of jquery.js (see note below) files in a directory there.

2. Modify the `pubmed_webbridge.js` file to change the variables

  `var PHP_FILE_LOC=""`

  to the web accessible location from step 1.  
   
  `var LIBRARY_PROXY_URL="yourlibrarydomain"`
  
  to your library proxy url, such as library.unl.edu which when paired with the proxy rewrite becomes
  http://o-some_vendor_url.library.unl.edu/rest_of_the_url
  
  `pid=""`
  
  to your id for crossref
  
  These are used to create the link to crossref 
  
  `<a href='http://0-www.crossref.org."+LIBRARY_PROXY_URL+"/openurl?pid="+pid+"&id=doi:"+doi+"'>Get Full Text through Crossref</a>"`

3.  Log in to your Sierra WebMaster and look for the html file in the live screens named `resserv_panel.html`

    Edit this file, and right after the div with the class 'citation' place the html snippet included in the pubmed_webbridge.html
    file in this repository.  
    
    You will need to edit it to point to the javascript files you stored in step 1.
    
    Save this file.
    
4. Test it from a pubmed article search, and click the webbridge button.


Note: We are using a later version of `jquery.1.*`  to allow for backward compatibility with earlier versions of Internet Explorer.  
Use the latest jquery if you don't have to worry about that.

This works on the premise that the link coming from pubmed contains the sid value of `Entrez:PubMed`.  Anything else, and this process is not triggered.

If you want to change formatting of the citation, it is in the `getCitation` function of the `pubmed_webbridge.js` file.  

