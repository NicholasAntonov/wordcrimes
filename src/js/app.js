/* jshint esversion: 6 */
window.onload = function() {
  "use-strict";
  
  //var dictionaryRoute = "js/json/wordvecs5000.json";
  var dictionaryRoute = "js/json/glove_small_dict.json";

  fetch(dictionaryRoute)
    .then(resp => {
      return resp.json().then(body => window.wordVecs = body);
    }, err => {
      console.warn("Error fetching", err);
    });


};