// Node modules
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var gamePredictor = require('./GamePredictor');

// Set the algorithm used to determine the winner of a game:
// 1: base on Seed (e.g. - 1 seed would beat a 16 seed)
// 2: base on which team has better overall stats
var algorithm = 2;

// Read CSV data file containing information for All Schools
var f = fs.readFileSync(path.join(__dirname, './resources/All_Schools.csv'), {encoding: 'utf-8'}, function(err) {
  console.log(err);
});
// Replace Windows end-of-line and split contents of the file by row
f = f.replace(/(\r\n)/g, '\n');
var rows = f.split("\n");
// Get first row for the column headers
var headers = rows.shift().split(",");

// Loop through each row, convert all data to a JSON object, and save to file
var jsonData = [];
rows.forEach(function(row) {
  var dataObj = {};
  var values = row.split(",");
  for (var i = 0; i < headers.length; i++) {
    if (!values[i]) {
      break;
    } else {
      var num = Number(values[i]);
      dataObj[headers[i]] = _.isNumber(num) && !_.isNaN(num) ? num : values[i].toString();
    }
  }
  // Add object to list
  if (Object.keys(dataObj).length > 0) {
    jsonData.push(dataObj);
  }
});
fs.writeFileSync(path.join(__dirname, './resources/All_Schools.json'), JSON.stringify(jsonData), 'utf8', function(err) {
  console.log(err);
});

// Pull out those teams that made the tournament sorted by Seed
var regions = new Array(2);
regions[0] = _.sortBy(_.where(jsonData, {Region: "N"}), "Seed");
regions[1] = _.sortBy(_.where(jsonData, {Region: "S"}), "Seed");
regions[2] = _.sortBy(_.where(jsonData, {Region: "E"}), "Seed");
regions[3] = _.sortBy(_.where(jsonData, {Region: "W"}), "Seed");

// Build the tournament as a multi-dimensional array.  There are six rounds of play in the tournament (and a 7th containing only the champion):
// round[0]: 32 games, 64 teams - "1st round" of the tournament
// round[1]: 16 games, 32 teams - "2nd round" of the tournament
// round[2]:  8 games, 16 teams - The Sweet 16
// round[3]:  4 games,  8 teams - The Elite 8
// round[4]:  2 games,  4 teams - The Final 4
// round[5]:  1 game,   2 teams - Determines the champion!
// round[6]:  The champion!
var tournament = [];
var factorCount = 6; // backwards counter used to determine the number of teams playing per round
for (var round = 0; round < 7; round++) {
  // Add a new list for each round
  tournament[round] = [];

  // The first rounds require playing in all 4 regions while the final three rounds require 1 loop of playing
  var maxLoops = round <= 3 ? 4 : 1;
  for (var region = 0; region < maxLoops; region++) {
    // Add a new list for each region
    // NOTE: round[4] has only 2 regions (region[0] and region[1]) and round[5] has only 1 (region[0])
    switch (round) {
      case 5:
        tournament[round][0] = [];
        break;
      case 4:
        tournament[round][0] = [];
        tournament[round][1] = [];
        break;
      default:
        tournament[round][region] = [];
        break;
    }

    // For each round and region, Add a new list for each game
    var teamsPerRound = Math.pow(2, factorCount);
    var teamsPerRegion = Math.ceil(teamsPerRound / 4);
    var gamesPerRound = Math.ceil(teamsPerRound / 2);
    var gamesPerRegion = Math.ceil((gamesPerRound / 4));
    for (var game = 0; game < gamesPerRegion; game++) {
      // NOTE: round[4] has only 2 regions (region[0] and region[1]) and round[5] has only 1 (region[0])
      if (round == 6) {
        // And the champion is...
        tournament[round][0].push(gamePredictor.playGame(tournament[round-1][0][0], algorithm));

      } else if (round == 5) {
        tournament[round][0][game] = [];
        // The following determines the Final Two
        tournament[round][0][game].push(gamePredictor.playGame(tournament[round-1][0][0], algorithm));
        tournament[round][0][game].push(gamePredictor.playGame(tournament[round-1][1][0], algorithm));
      } else if (round == 4) {
        tournament[round][0][game] = [];
        tournament[round][1][game] = [];
        // The following determines the Final Four
        tournament[round][0][game].push(gamePredictor.playGame(tournament[round-1][0][0], algorithm));
        tournament[round][0][game].push(gamePredictor.playGame(tournament[round-1][1][0], algorithm));
        tournament[round][1][game].push(gamePredictor.playGame(tournament[round-1][2][0], algorithm));
        tournament[round][1][game].push(gamePredictor.playGame(tournament[round-1][3][0], algorithm));
      } else {
        tournament[round][region][game] = [];

        // If this is the first round (the one with 64 teams), add the teams based on Seed:
        // - for example, for each region: [[[[1, 16], [8, 9]], [[4, 13], [5, 12]]], [[[3, 14], [6, 11]], [[2, 15], [7, 10]]]]
        // Else add the teams based upon the results of the previous round's game
        var higherSeed = game;
        var lowerSeed = (teamsPerRegion - 1) - game;
        if (round == 0 && game < gamesPerRegion) {
            tournament[round][region][game].push(regions[region][higherSeed]);
            tournament[round][region][game].push(regions[region][lowerSeed]);
        } else if (round != 0 && round < 4) {
          tournament[round][region][game].push(gamePredictor.playGame(tournament[round-1][region][higherSeed], algorithm));
          tournament[round][region][game].push(gamePredictor.playGame(tournament[round-1][region][lowerSeed], algorithm));
        }
      }
    }
  }
  factorCount--
}

// Cleanup the contents of the tournament results - only keep the object attributes we care about
// and write the results to a file...
tournament[6][0][0] = _.pick(tournament[6][0][0], 'Team', 'Region', 'Seed');
for (var i = 0; i < tournament.length; i++) {
  for (var j = 0; j < tournament[i].length; j++) {
    for (var k = 0; k < tournament[i][j].length; k++) {
      for (var l = 0; l < tournament[i][j][k].length; l++) {
        if (_.isObject(tournament[i][j][k][l]) && !_.isArray(tournament[i][j][k][l])) {
          tournament[i][j][k][l] = _.pick(tournament[i][j][k][l], 'Team', 'Region', 'Seed')
        }
      }
    }
    fs.writeFileSync(path.join(__dirname, './output/Round' + (i + 1) + '-Region' + (j + 1) + '.json'), JSON.stringify(tournament[i][j]), 'utf8', function(err) {
      console.log(err);
    });
  }
}
