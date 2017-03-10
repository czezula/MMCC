
/**
 * Takes in a list of teams that will play the game and uses an algorithm the determine the winner
 * @param teams     Array The list of two teams that will play the game
 * @param algorithm int   Number corresponding to the algorithm to use (default to 1 if not provided)
 * @returns The winning team
 */
function playGame(teams, algorithm) {
  if (!algorithm) {
    algorithm = 1
  }

  switch (algorithm) {
    case 1:
    default:
      // Determines the winner by simply looking at Seed
      // - lower number is better (i.e. = 1 seed is better than 16 seed)
      return teams[0].Seed <= teams[1].Seed ? teams[0] : teams[1];
      break;
    case 2:
      // TODO: Replace with a stat comparator
      return teams[0].Seed <= teams[1].Seed ? teams[0] : teams[1];
      break;
  }
}

module.exports = {
  playGame: playGame
};