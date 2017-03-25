/* jshint esversion: 6 */
'use-strict';

gameSize = 25;
answerCount = 8;

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
    .then(() => {
      // gen gameSize random words
      totalWords = randomWords(gameSize, allWords);

      console.log(totalWords);
      // pick solutionSize random from them to be solutions
      goodWords = _.sampleSize(totalWords, answerCount);
      console.log(goodWords);
      // all else are badWords
      badWords = _.xor(totalWords, goodWords);
      console.log(badWords);


      // cluster by vector the solutions into numberOfHints groups
      const clusters = cluster();
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
      const hints = hintVectors
            .map(hint => Word2VecUtils.getNClosestMatches(3, hint).map(arr => arr[0]));
      console.log(hints);

      // |> findNClosest (numberOfHints / group.len)
    });
};
