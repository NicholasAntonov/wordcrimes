/* jshint esversion: 6 */
'use-strict';

gameSize = 26;
answerCount = 9;
rightLeft = answerCount;
MAXMISSES = 3;
var holdWords = [];
var dictionaryRoute = "js/json/wordvecs1000.json";
var mode = "normal";

function cluster () {
  const clusters = goodWords.map(baseWord => {
    const s = [];
    let close;
    let best;
    let rest = [...totalWords];
    let clusterVec = wordVecs[baseWord];
    do {
      close = [...rest]
        .sort((a, b) => Word2VecUtils.getCosSim(wordVecs[baseWord], wordVecs[b]) - Word2VecUtils.getCosSim(wordVecs[baseWord], wordVecs[a]));
      best = close.shift();
      rest = close;
      s.push(best);
      clusterVec = wordVecs[baseWord].map((a, i) => _.mean(s.map(c => wordVecs[c][i])));
    } while (goodWords.includes(rest[0]));
    return s;
  }).map(arr => arr.sort());
  return _.uniqBy(clusters, a => a.join('|'));
}

function avgWords (s) {
  return wordVecs[s[0]].map((a, i) => _.mean(s.map(c => wordVecs[c][i])));
}

function randomWords (n, words) {
  return _.range(n)
    .map(() => words[_.random(0, words.length - 1)]);
}

function addAll(words) {
  return words.map(word => wordVecs[word]).slice(1).reduce(Word2VecUtils.addVecs, wordVecs[words[0]]);
}

function populateUI(words, hints) {
  var wordList = document.querySelector("#words");
  
  // empty the list of words
  while (wordList.hasChildNodes()) wordList.removeChild(wordList.lastChild);
  
  // add all the words to the word list
  _.each(words, word => {
    var guessed = guessedWords.includes(word);
    var div = document.createElement("div");
    div.innerHTML = word;
    div.className = "word";
    if(!guessed)
      div.addEventListener('click', clickWord);
    wordList.appendChild(div);
  });

  updateClues();
}

function clickWord(e) {
  var word = e.target.innerHTML;
  guessedWords.push(word);
  e.target.className = "word " + (goodWords.includes(word) ? "hit" : "miss");
  if(goodWords.includes(word)){
    //then we have a correct word.. sub from rightleft
    rightLeft--;
    if(rightLeft==0){
      endGame("win");
    }
  }
  numMisses.innerHTML = _.pull(_.clone(guessedWords), ...goodWords).length;
  //check to see if numMisses exceeds limit
  if(numMisses.innerHTML == MAXMISSES){
    endGame("lose");
  }
  e.target.removeEventListener('click', clickWord, false);
  updateClues();
}

// updates the clue render
function updateClues() {
  let clues = hints.map((h, i)=>synthesizeHint(totalWords, h, clusters[i]));
  clues.sort((a, b) => a[0] - b[0]);
  clues = _.uniqBy(clues, a => a[1]);
  clues = clues.sort((a, b) => (a[1] === b[1]) ? 0 : (a[1] < b[1]) ? -1 : 1);


  let clueList = document.querySelector("#clues");

  // empty the list of clues
  while (clueList.hasChildNodes()) clueList.removeChild(clueList.lastChild);

  // add all the clues to the clue list
  _.each(clues, clue => {
    var div = document.createElement("div");
    div.className = "clue";
    div.innerHTML = `<span class="num">` + clue[0] + `</span> - ` + 
                    `<span class="word">` + clue[1] + `</span>`;
    clueList.appendChild(div);
  });

}

function synthesizeHint(words, clues, cluster) {
  // remove all the already guessed words from the cluster
  _.remove(cluster, w => guessedWords.includes(w));

  var blob = words.join(" ");
  console.log(clues.join(", "), '->', cluster.join(", "));
  for(var i = 0; i < clues.length; i++) {
    var hint = clues[i];
    if(blob.indexOf(hint) === -1 && hint.indexOf(blob) === -1){ // because "designer" can be inside "designers"
      return [cluster.length, hint];
    }
  }
  console.log('GIVING A CHEATING HINT', clues[0]);
  return [cluster.length, clues[0]]; // shit
}

function clickStartGame() {

  if(mode=="sat"){
    //get SAT words to be intersectionsection with our words..
    fetch("js/json/freevocabulary_words.json")
      .then(resp => {
        return resp.json();
      })
      .catch(err => {
        console.warn("Error fetching", err);
      })
      .then(body => {
        window.counters = body;
        for (var i = 0; window.counters.length>i; i++) {
          holdWords.push(window.counters[i].word);
        }
      })
    }
  console.log("Here");
  fetch(dictionaryRoute)
    .then(resp => {
      return resp.json();
    })
    .catch(err => {
      console.warn("Error fetching", err);
    })
    .then(body => {
      window.wordVecs = body;
      window.allWords = Object.keys(body);
      console.log(allWords);
      //this is where I should do the union between the two arrays? try it
      //console.log(window.allWords);
    })
    // .then(clickStartGame);


  //popup1.style.display = "none";
  loosingOverlay.style.display = "none";
  winningOverlay.style.display = "none";
  window.requestAnimationFrame(()=>{
    loadingOverlay.style.display = "flex";
    content.style.filter="blur(5px)";
    numMisses.innerHTML = 0;
    rightLeft = answerCount;

    // empty the list of clues and words
    var clueList = document.querySelector("#clues");
    while (clueList.hasChildNodes()) clueList.removeChild(clueList.lastChild);
    var wordList = document.querySelector("#words");
    while (wordList.hasChildNodes()) wordList.removeChild(wordList.lastChild);

    setTimeout(startGame, 50);
  });
}

// Starts a new game
function startGame() {

  // gen gameSize random words
  var intersection;
  if(mode=="sat") {
    intersection = _.intersection(holdWords, allWords); //get the intersection of the words
  }
  else {
    intersection = allWords;
  }
  console.log('INTERSECTION LENGTH', intersection.length);
  do {
    console.log('generatingwords');
    totalWords = randomWords(gameSize, intersection);
  } while(_.uniq(totalWords).length !== totalWords.length);

  guessedWords = [];

  console.log(totalWords);
  // pick solutionSize random from them to be solutions
  goodWords = _.sampleSize(totalWords, answerCount);
  console.log(goodWords);
  // all else are badWords
  badWords = _.xor(totalWords, goodWords);
  console.log(badWords);


  // cluster by vector the solutions into numberOfHints groups
  clusters = cluster();
  console.log(clusters);



  const badWordsSum = avgWords(badWords);
  console.log('bad', badWordsSum);
  const hintVectors = clusters
        // for each group
        .map(cluster => {
          // add all vectors in group
          // subtract sum of vectors in badWords
          return Word2VecUtils.subVecs(avgWords(cluster), badWordsSum);
        });
  hints = hintVectors
    .map((hint, index, array) => Word2VecUtils.getNClosestMatches(array.length + 4, hint).map(arr => arr[0]));
  console.log(hints);

  // |> findNClosest (numberOfHints / group.len)

  populateUI(totalWords);

  loadingOverlay.style.display = "none";
  content.style.filter="none";
}

window.onload = function() {
  content.style.filter="blur(5px)";
  fetch(dictionaryRoute)
    .then(resp => {
      return resp.json();
    })
    .catch(err => {
      console.warn("Error fetching", err);
    })
    .then(body => {
      window.wordVecs = body;
      window.allWords = Object.keys(body);
      console.log(allWords);
      //this is where I should do the union between the two arrays? try it
      //console.log(window.allWords);
    })
    .then(clickStartGame);
  //took the json stuff and put it in clickStartGame function..
};

function endGame(which) {
  if(which=="lose") {
    window.requestAnimationFrame(()=>{
      loosingOverlay.style.display = "flex";
      content.style.filter="blur(5px)";

      // empty the list of clues and words
      var clueList = document.querySelector("#clues");
      while (clueList.hasChildNodes()) clueList.removeChild(clueList.lastChild);
      var wordList = document.querySelector("#words");
      while (wordList.hasChildNodes()) wordList.removeChild(wordList.lastChild);

      
    });
  }else{
    //win
    window.requestAnimationFrame(()=>{
      winningOverlay.style.display = "flex";
      content.style.filter="blur(5px)";

      // empty the list of clues and words
      var clueList = document.querySelector("#clues");
      while (clueList.hasChildNodes()) clueList.removeChild(clueList.lastChild);
      var wordList = document.querySelector("#words");
      while (wordList.hasChildNodes()) wordList.removeChild(wordList.lastChild);

      
    });
  }
}

function adjustSettings(){
  var select = document.getElementById("amountOfWords");
  console.log(select);
  var words = select.options[select.selectedIndex].value;

  if(words=="complex"){
    dictionaryRoute = "js/json/glove_small_dict.json"
  }else{
    dictionaryRoute = "js/json/wordvecs" + words + ".json";
  }

  select = document.getElementById("diff");
  var diff = select.options[select.selectedIndex].value;
  if(diff=="easy"){
    MAXMISSES = 5;
  }else if(diff=="normal"){
    MAXMISSES=3;
  }else{
    MAXMISSES=1;
  }

  document.getElementById('maxMisses').innerHTML = MAXMISSES;

  select = document.getElementById("mode");
  // var themode = select.options[select.selectedIndex].value;
  // if(themode=="sat"){
  //   mode="sat";
  // }else{
    mode="normal";
  // }

  popup1.style.opacity = "0";
  popup1.style.display = "none";
  popup1.style.visibility = "hidden";

  clickStartGame();
}

function showPopUp(){
  popup1.style.opacity = "1";
  popup1.style.display = "flex";
  popup1.style.visibility = "visible";
  console.log("Here");
}

function closePopUp(){
  popup1.style.opacity = "0";
  popup1.style.display = "flex";
  popup1.style.visibility = "hidden";
}
