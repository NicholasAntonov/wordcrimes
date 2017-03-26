/* jshint esversion: 6 */
'use-strict';

gameSize = 26;
answerCount = 9;

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
  console.log(e.target.className);
  e.target.removeEventListener('click', clickWord, false);
  updateClues();
}

// updates the clue render
function updateClues() {
  var clues = hints.map((h, i)=>synthesizeHint(totalWords, h, clusters[i]));

  var clueList = document.querySelector("#clues");

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
    if(blob.indexOf(hint) == -1) // because "designer" can be inside "designers"
      return [cluster.length, hint];
      
  }
  return [cluster.length, clues[0] + " CHEAT"]; // shit
}

// Starts a new game
function startGame() {
  // gen gameSize random words
  totalWords = randomWords(gameSize, allWords);

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
        .map(hint => Word2VecUtils.getNClosestMatches(3, hint).map(arr => arr[0]));
  console.log(hints);

  // |> findNClosest (numberOfHints / group.len)

  populateUI(totalWords);
}

window.onload = function() {

  //var dictionaryRoute = "js/json/wordvecs5000.json";
  var dictionaryRoute = "js/json/glove_small_dict.json";

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
    })
    .then(startGame);
};
