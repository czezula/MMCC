# March Madness Code Challenge
This node.js code reads in a data set of men's college basketball teams
and stats, organizes the teams that made the tournament by seeding, and
predicts the winner by playing each matchup.  The algorithm used to determine
the matchup winner could be modified to consider multiple factors in
predicting the winner.

## Instructions
* Install node.js 8.x or higher: [https://nodejs.org](https://nodejs.org/en/)
* From the project directory, download and install the node modules:
    * `npm install`
* Run the code:
    * `node marchMadnessCodeChallenge.js`
    * **Input**: *./resources*
    * **Output**: *./output*

## Resources
Source team information was obtained from [Pomeroy College Basketball Ratings](http://kenpom.com/)
and saved as All_Schools.csv.  Tournament seeding information was added, and the code converts the data
to JSON before saving it to *./resources/All_Schools.json*.

## Output
The output is organized by Round and Region:
* **Round1-Region[1-4].json**: The 1st round matchups (64 teams)
* **Round2-Region[1-4].json**: The 2nd round matchups (32 teams)
* **Round3-Region[1-4].json**: The Sweet 16 matchups
* **Round4-Region[1-4].json**: The Elite 8 matchups
* **Round5-Region[1-2].json**: The Final 4 matchups
* **Round6-Region1.json**: The Championship matchup
* **Round7-Region1.json**: The Champion!

# Algorithm
The code contains the following algorithms, with the ability to expand to more:
1. Determines the winner by simply looking at tournament Seed (e.g. - 1 seed beats a 16 seed)
2. One point awarded to the team with the better rank in each stat.  Team with most points wins.
3. One point awarded to the team with the better stat (including Rank).  Extra point for a 1 or 2 seed.  Team with most points wins.
4. One point awarded to the team with the better stat (NOT including Rank).  Extra point for a 1 or 2 seed.  Team with most points wins.
