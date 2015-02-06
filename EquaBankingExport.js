// ==UserScript==
// @name        Better Equabanking Transaction History Export
// @namespace   cz.hohy.equa.history
// @include     *.equabanking.cz/IBS/*index2.jsp*
// @version     1
// @grant       none
// ==/UserScript==  

var doc = document;

// check if we are on correct page
var h2s = doc.getElementsByTagName("h2");
var pageOk = false;
for (var i=0; i<h2s.length; i++) {
  if(h2s[i].textContent.indexOf("Transakèní historie") >= 0) {    
    pageOk = true;
    break;
  }
}

if(pageOk) {
  console.log("Creating button...");
  
  // create new button
  var exportButton = document.createElement("a");
  exportButton.innerHTML = "Export Google Docs";
  exportButton.class = "btn";
  //exportButton.href = "javascript:void(0);"
  exportButton.onclick = exportTransactionsToGD;
  
  // add it to the page
  doc.getElementById("exportCSVID").parentElement.appendChild(exportButton);    
  
  // run data processing
  processPage();
} else {
  console.log("Not a correct page!");
}

// On click action for the Export button.
function exportTransactionsToGD() {   
  localStorage.setItem("status", "working");

  // is pagination available?
  if($("td.pages").length > 0) { // YES
    
    // are we on the first page?
    if ($("a.button.prev").length > 0) { // NO
      // set status and go there
      console.log("Redirecting to first page...");
      $("div.pagination a.button:contains('Jít na první')")[0].click();      
      return;
    }
  }
  // do the processing for this page
  processPage();    
}

// Get list of the transactions on this page, add them 
// to transactions from previous pages and decide what 
// will be next action
function processPage() {
  
  var status = localStorage.getItem("status");
  console.log("Processing page status: " + status);
  
  if (status == "working") {
      // get data from current page;
      var currentTransactions = getTransactionsList();
      
      // join previous and current transactions
      var previousTransactions = JSON.parse(localStorage.getItem('transactionList'));
      if (previousTransactions == null) {
        previousTransactions = [];
      }
      for (var i = 0; i < currentTransactions.length; i++) {
        previousTransactions[previousTransactions.length] = currentTransactions[i];
      }
      
      // store the whole list into the local storage
      localStorage.setItem('transactionList',JSON.stringify(previousTransactions));
      console.log("Saved " + previousTransactions.length + " transactions to local storage");  
    
      // are we on the last page?
      if($("a.button.next").length > 0) { // No, continue on next page
        console.log("Done with this page, redirecting to next one.");
        $("a.button.next")[0].click();
      } else {
        console.log("Done with this page. No more pages to process, show result.");
        // Yes, we are finished
        localStorage.removeItem("status");
        localStorage.removeItem('transactionList');
        
        // Display results
        var resultDiv = document.createElement("div");
        resultDiv.style = "height: 200px; overflow:scroll; background-color: rgba(203, 245, 122, 1); border: solid  1px rgba(34, 126, 0, 1);";
        var resultCSV = "";
        for(var i = 0; i < previousTransactions.length; i++) {
          resultCSV += generateCSV(previousTransactions[i]) + "<br/>";
        }
        resultDiv.innerHTML = resultCSV;
        
        // add it to the page
        doc.getElementById("movements_list_id").appendChild(resultDiv);
      }
   }    
}

// Parse transactions on current page.
function getTransactionsList() {  
  var tableRows = $("table#transaction-history tr[id^=a]");
  var transactions = [];
  
  for(var i=0;i<tableRows.length;i++) {  
    console.log("Processing " + (i+1) + ". transaction.");
    var transaction = {};
    transaction.date = tableRows.eq(i).find(".highlight strong")[0].textContent;
    transaction.title = tableRows.eq(i).find("a[id^=detailaddCat] strong")[0].textContent;
    transaction.info = tableRows.eq(i).find("span.small")[0].textContent;
    transaction.number = tableRows.eq(i).find("td.number")[0].textContent;
    transaction.amount = tableRows.eq(i).find("td.amount")[0].textContent;
    transactions[i] = transaction;
  }
  console.log("Parsed " + transactions.length + " transactions.");
  return transactions;
}

function generateCSV(transaction) {
  return transaction.date + ";" +
    transaction.title + ";" +
    transaction.info + ";" +
    transaction.number + ";" +
    transaction.amount + ";"
}
