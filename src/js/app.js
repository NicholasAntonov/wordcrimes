/* jshint esversion: 6 */
'use-strict';

gameSize = 25;
answerCount = 8;

function cluster () {
  const clusters = goodWords.map(baseWord => {
    const s = new Set();
    let close;
    let best;
    let rest = [...totalWords];
    let clusterVec = wordVecs[baseWord];
    do {
      close = [...rest]
        .sort((a, b) => Word2VecUtils.getCosSim(wordVecs[baseWord], wordVecs[b]) - Word2VecUtils.getCosSim(wordVecs[baseWord], wordVecs[a]));
      best = close.shift();
      rest = close;
      s.add(best);
      clusterVec = wordVecs[baseWord].map((a, i) => _.mean([...s].map(c => wordVecs[c][i])));
    } while (goodWords.includes(rest[0]));
    return [...s];
  }).map(arr => arr.sort());
  return _.uniqBy(clusters, a => a.join('|'));
}

function randomWords (n, wordVecs) {
  return _.range(n)
    .map(() => wordVecs[_.random(0, wordVecs.length - 1)]);
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
    })
    .then(() => {
      // gen gameSize random words
      totalWords = randomWords(20, wordVecs);

      // pick solutionSize random from them to be solutions
      goodWords = _.sampleSize(totalWords, answerCount);
      // all else are badWords
      badWords = _.xor(totalWords, goodWords);


      // cluster by vector the solutions into numberOfHints groups
      console.log(cluster());


      // for each group
      // add all vectors in group
      // subtract sum of vectors in badWords

      // |> findNClosest (numberOfHints / group.len)
    });
};
