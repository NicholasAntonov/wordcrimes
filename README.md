# Word Crime

###### This project was made for [duckhacks](https://www.duckhacks.com) at [Stevens Institute of Technology](https://www.stevens.edu)

## Premise
You, the player, are a detective in the field, and the only resource you have is an AI that is trained to connect clues.
Your task is to find the right word associations among a grid of words, using hints given by the AI computer. But if you
guess the wrong words too many times, you wont have accurate enough clues to solve the case.


## Game Play
- The player selects one word at a time from a grid, and must select all of the correct words to win.
- They are given hints by the AI, each consisting of a word, and the number of words that it is related to in the grid.
- If a word is correctly chosen, it is highlighted (blue/green). Otherwise, it is highlighted red.
- For every incorrectly guessed word, the player gets a strike. It is too late to connect the right words after three strikes.

## TODO
- Player v Player
- Difficulties
  - Changing the number of strikes allowed
  - Using larger dictionary/more difficult associations
- Potentially different game modes

## Proposed Implementation
word2vec JavaScript implementation
Vector clustering algorithm
