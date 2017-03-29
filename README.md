# Word Crimes

###### This project was made for [duckhacks](http://www.duckhacks.com) at [Stevens Institute of Technology](https://www.stevens.edu)

###### Update: It won! "Best Overall" for Duckhacks 2017

[Play Word Crimes Here!](http://imadethis.website/wordcrimes/)

## Premise
You, the player, are a detective in the field, and the only resource you have is an AI that is trained to connect clues.
Your task is to find the right word associations among a grid of words, using hints given by the AI computer. But if you
guess the wrong words too many times, you wont have accurate enough clues to solve the case.


## Game Play
- The player selects one word at a time from a grid, and must select all of the correct words to win.
- They are given hints by the AI, each consisting of a word, and the number of words that it is related to in the grid.
- If a word is correctly chosen, it is highlighted green. Otherwise, it is highlighted red.
- For every incorrectly guessed word, the player gets a strike. It is too late to connect the right words after three strikes.

## Implementation
Using a JavaScript implementation of Google's word2vec

Custom vector clustering algorithm for generating clues

Custom, minimal front end design

## To Run
Navigate to `src` directory and start local server

## The code

Its a hackathon. This whole thing is hacks. No clean React
or redux implementations here, just plain old javascript.
