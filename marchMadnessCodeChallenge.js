// Node modules
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const _ = require('underscore')
let gamePredictor = require('./GamePredictor')

// Set the algorithm used to determine the winner of a game:
// 1: base on Seed (e.g. - 1 seed would beat a 16 seed)
// 2: base on which team has better Rank in each stat
// 3: base on which team has better overall stats (including Rank)
// 4: base on which team has better overall stats (NOT including Rank)
const algorithm = 4
// TODO: Read algorithm from the command line

// Read CSV data file containing information for All Schools
let f = fs.readFileSync(path.join(__dirname, './resources/All_Schools.csv'), {encoding: 'utf-8'}, function(err) {
  console.log(err)
})
// Replace Windows end-of-line and split contents of the file by row
f = f.replace(/(\r\n)/g, '\n')
const rows = f.split("\n")
// Get first row for the column headers
const headers = rows.shift().split(",")

// Loop through each row, convert all data to a JSON object, and save to file
let jsonData = []
rows.forEach(function(row) {
  let dataObj = {}
  const values = row.split(",")
  for (let i = 0; i < headers.length; i++) {
    if (!values[i]) {
      break
    } else {
      const num = Number(values[i])
      dataObj[headers[i]] = _.isNumber(num) && !_.isNaN(num) ? num : values[i].toString()
    }
  }
  // Add object to list
  if (Object.keys(dataObj).length > 0) {
    jsonData.push(dataObj)
  }
})
fs.writeFileSync(path.join(__dirname, './resources/All_Schools.json'), JSON.stringify(jsonData), 'utf8', function(err) {
  console.log(err)
})

// Pull out those teams that made the tournament sorted by Seed
let regions = []
regions[0] = _.sortBy(_.where(jsonData, {Region: "South"}), "Seed")
regions[1] = _.sortBy(_.where(jsonData, {Region: "West"}), "Seed")
regions[2] = _.sortBy(_.where(jsonData, {Region: "East"}), "Seed")
regions[3] = _.sortBy(_.where(jsonData, {Region: "Midwest"}), "Seed")

// Build the tournament as a multi-dimensional array.  There are six rounds of play in the tournament (and a 7th containing only the champion):
// round[0]: 32 games, 64 teams - "1st round" of the tournament
// round[1]: 16 games, 32 teams - "2nd round" of the tournament
// round[2]:  8 games, 16 teams - The Sweet 16
// round[3]:  4 games,  8 teams - The Elite 8
// round[4]:  2 games,  4 teams - The Final 4
// round[5]:  1 game,   2 teams - Determines the champion!
// round[6]:  The champion!
let tournament = []
let factorCount = 6 // backwards counter used to determine the number of teams playing per round
for (let round = 0; round < 7; round++) {
  // Add a new list for each round
  tournament[round] = []

  // The first rounds require playing in all 4 regions while the final three rounds require 1 loop of playing
  const maxLoops = round <= 3 ? 4 : 1
  for (let region = 0; region < maxLoops; region++) {
    // Add a new list for each region
    // NOTE: round[4] has only 2 regions (region[0] and region[1]) and round[5] has only 1 (region[0])
    switch (round) {
      case 5:
        tournament[round][0] = []
        break
      case 4:
        tournament[round][0] = []
        tournament[round][1] = []
        break
      default:
        tournament[round][region] = []
        break
    }

    // For each round and region, Add a new list for each game
    const teamsPerRound = Math.pow(2, factorCount)
    const teamsPerRegion = Math.ceil(teamsPerRound / 4)
    const gamesPerRound = Math.ceil(teamsPerRound / 2)
    const gamesPerRegion = Math.ceil((gamesPerRound / 4))
    for (let game = 0; game < gamesPerRegion; game++) {
      // NOTE: round[4] has only 2 regions (region[0] and region[1]) and round[5] has only 1 (region[0])
      if (round === 6) {
        // And the champion is...
        tournament[round][0].push(gamePredictor.playGame(tournament[round-1][0][0], algorithm))

      } else if (round === 5) {
        tournament[round][0][game] = []
        // The following determines the Final Two
        tournament[round][0][game].push(gamePredictor.playGame(tournament[round-1][0][0], algorithm))
        tournament[round][0][game].push(gamePredictor.playGame(tournament[round-1][1][0], algorithm))
      } else if (round === 4) {
        tournament[round][0][game] = []
        tournament[round][1][game] = []
        // The following determines the Final Four
        tournament[round][0][game].push(gamePredictor.playGame(tournament[round-1][0][0], algorithm))
        tournament[round][0][game].push(gamePredictor.playGame(tournament[round-1][1][0], algorithm))
        tournament[round][1][game].push(gamePredictor.playGame(tournament[round-1][2][0], algorithm))
        tournament[round][1][game].push(gamePredictor.playGame(tournament[round-1][3][0], algorithm))
      } else {
        tournament[round][region][game] = []

        // If this is the first round (the one with 64 teams), add the teams based on Seed:
        // - for example, for each region: [[[[1, 16], [8, 9]], [[4, 13], [5, 12]]], [[[3, 14], [6, 11]], [[2, 15], [7, 10]]]]
        // Else add the teams based upon the results of the previous round's game
        const higherSeed = game
        const lowerSeed = (teamsPerRegion - 1) - game
        if (round === 0 && game < gamesPerRegion) {
            tournament[round][region][game].push(regions[region][higherSeed])
            tournament[round][region][game].push(regions[region][lowerSeed])
        } else if (round !== 0 && round < 4) {
          tournament[round][region][game].push(gamePredictor.playGame(tournament[round-1][region][higherSeed], algorithm))
          tournament[round][region][game].push(gamePredictor.playGame(tournament[round-1][region][lowerSeed], algorithm))
        }
      }
    }
  }
  factorCount--
}

// Cleanup the contents of the tournament results - only keep the object attributes we care about
// and write the results to a file...
try {
  mkdirp.sync('./output')
} catch (e) {
  console.error("Could not create output directory: ", e)
}

tournament[6][0][0] = _.pick(tournament[6][0][0], 'Team', 'Region', 'Seed')
for (let i = 0; i < tournament.length; i++) {
  for (let j = 0; j < tournament[i].length; j++) {
    for (let k = 0; k < tournament[i][j].length; k++) {
      for (let l = 0; l < tournament[i][j][k].length; l++) {
        if (_.isObject(tournament[i][j][k][l]) && !_.isArray(tournament[i][j][k][l])) {
          tournament[i][j][k][l] = _.pick(tournament[i][j][k][l], 'Team', 'Region', 'Seed')
        }
      }
    }
    fs.writeFileSync(path.join(__dirname, './output/Round' + (i + 1) + '-Region' + (j + 1) + '.json'), JSON.stringify(tournament[i][j]), 'utf8', function(err) {
      console.log(err)
    })
  }
}
