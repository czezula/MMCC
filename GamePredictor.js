/**
 * Takes in a list of teams that will play the game and uses an algorithm the determine the winner
 * @param  {Array}  teams      The list of two teams that will play the game
 * @param  {int}    algorithm  The number corresponding to the algorithm to use (default to 1 if not provided)
 * @return {Object} The winning team
 */
function playGame(teams, algorithm) {
  if (!algorithm) {
    algorithm = 1
  }
  var totalPtsTeam0 = 0, totalPtsTeam1 = 0;

  switch (algorithm) {
    case 1:
    default:
      // Determines the winner by simply looking at Seed
      break;
    case 2:
      /*
       * Determines the winner by analyzing the following stats:
       * - AdjEM - Adjusted Efficiency Margin
       * - AdjO - Adjusted Offensive Efficiency: points scored per 100 possessions (adjusted for opponent)
       * - AdjORank - Ranking of AdjO among all schools
       * - AdjD - Adjusted Defensive Efficiency: points allowed per 100 possessions (adjusted for opponent)
       * - AdjDRank - Ranking of AdjD among all schools
       * - AdjT - Adjusted Tempo: possessions per 40 minutes (adjusted for opponent)
       * - AdjTRank - Ranking of AdjT among all schools
       * - Luck - Luck rating
       * - LuckRank - Ranking of Luck among all schools
       * - SOSAdjEM - Strength of Schedule - Adjusted Efficiency Margin rating
       * - SOSAdjEMRank - Ranking of SOSAdjEM among all schools
       * - SOSOppO - Strength of Schedule - Average Adjusted Offensive Efficiency of opposing offenses
       * - SOSOppORank - Ranking of SOSOppO among all schools
       * - SOSOppD - Strength of Schedule - Average Adjusted Defensive Efficiency of opposing defenses
       * - SOSOppDRank - Ranking of SOSOppD among all schools
       * - NCSOSAdjEM - Non-Conference Strength of Schedule - Adjusted Efficiency Margin
       * - NCSOSAdjEMRank - Ranking of NCSOSAdjEM among all schools
       *
       * 1. One point is awarded to the team with the better rank in each stat
       * The team with the most points wins
       */
      ["AdjORank", "AdjDRank", "AdjTRank", "LuckRank", "SOSAdjEMRank", "SOSOppORank", "SOSOppDRank", "NCSOSAdjEMRank"].forEach(function(stat) {
        if (teams[0][stat] < teams[1][stat]) {
          totalPtsTeam0++
        } else {
          totalPtsTeam1++
        }
      });
      break;
    case 3:
      /*
       * Determines the winner by analyzing the stats listed in the algorithm above:
       * 1. One point is awarded to the team with the better rank in each stat
       * 2. One or more points is awarded to the team that is better in each individual stat.  Extra point for every difference of 10 or more!
       * The team with the most points wins
       */
      ["AdjEM", "AdjO", "AdjORank", "AdjD", "AdjDRank", "AdjT", "AdjTRank", "Luck", "LuckRank", "SOSAdjEM", "SOSAdjEMRank", "SOSOppO", "SOSOppORank", "SOSOppD", "SOSOppDRank", "NCSOSAdjEM", "NCSOSAdjEMRank"].forEach(function(stat) {
        if (stat.endsWith('Rank')) {
          if (teams[0][stat] < teams[1][stat]) {
            totalPtsTeam0++
          } else {
            totalPtsTeam1++
          }
        }
      });
      break;
  }

  // The team with the most points wins!
  if (totalPtsTeam0 > totalPtsTeam1) {
    return teams[0]
  } else if (totalPtsTeam0 < totalPtsTeam1) {
    return teams[1]
  } else {
    // Pts are tied, so just return the better seed - lower number is better (i.e. = 1 seed is better than 16 seed)
    return teams[0].Seed <= teams[1].Seed ? teams[0] : teams[1];
  }
}

module.exports = {
  playGame: playGame
};