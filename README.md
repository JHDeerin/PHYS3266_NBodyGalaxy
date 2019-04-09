# PHYS 3266 - N-Body Galaxy #
A repository for our final project in PHYS 3266 (Computational Physics) at Georgia Tech, Spring 2019.

To view this project in action, please visit the site here: <https://jhdeerin.github.io/PHYS3266_NBodyGalaxy/>

## To Run Locally: ##
1) Clone the project repository to your computer
2) Navigate via command line inside the `PHYS3266_NBodyGalaxy` folder
3) Open a local static server to temporarily host the website; for Python 3.x users, this can be done by just running the command `python -m http.server 8000` inside the project directory (named above)
> The reason this is needed is because of the project's use of JavaScript's ES6 modules, which requires a server of some kind to work; see [here](https://salomvary.com/es6-modules-in-browsers.html) for more about this
4) Go to `localhost:8000` in your browser of choice, and bam! You're done!
