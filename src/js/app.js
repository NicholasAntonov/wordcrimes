/* jshint esversion: 6 */
'use-strict';

gameSize = 7;
answerCount = 3;

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

function randomWords (n, words) {
  return _.range(n)
    .map(() => words[_.random(0, words.length - 1)]);
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
      console.log(cluster());


      // for each group
      // add all vectors in group
      // subtract sum of vectors in badWords

      // |> findNClosest (numberOfHints / group.len)
    });
};
