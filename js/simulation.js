// TODO: Holy cow, this whole thing is in MAJOR need of refactoring

import { initCanvas, renderSimulation } from './drawing.js';
import { GravityCalculator, GravityObject, Point3D } from './simulationClasses.js';

// TODO: Refactor this/expose it all to the UI
let simulation = null;
let isRunning = true;

initSimulation();
runSimulation();

function initSimulation() {
    initCanvas();

    //TODO: Separate out UI code from this if possible
    const numObj = getNum('numObj');
    const galaxyRadius = getNum('maxDist');
    const maxSpeed = getNum('maxSpeed');

    const bigG = getNum('bigG');
    const dt = getNum('dt');
    const theta = getNum('theta');

    let objects = spawnRandomObjects(numObj, galaxyRadius, maxSpeed);
    //let objects = spawnTrinarySystem();
    
    simulation = new GravityCalculator(objects, bigG, dt, theta);

    // Render sim so restarting while paused doesn't leave a blank canvas
    renderSimulation(simulation);
}

function spawnRandomObjects(numObjects, maxDistLightYears, maxVelocity) {
    let objects = [];
    function randRange(min, max) {
        return Math.random()*(max - min) + min;
    }

    const LIGHT_YEAR_METERS = 9.461e15;
    const MAX_DIST = maxDistLightYears * LIGHT_YEAR_METERS;
    for (let i = 0; i < numObjects; i++) {
        let position = new Point3D(randRange(-MAX_DIST, MAX_DIST),
                                   randRange(-MAX_DIST, MAX_DIST),
                                   0);//randRange(-MAX_DIST, MAX_DIST));
        let velocity = new Point3D(randRange(-maxVelocity, maxVelocity),
                                   randRange(-maxVelocity, maxVelocity),
                                   0);//randRange(-maxVelocity, maxVelocity));
        let mass = randRange(1.0e30, 8.0e30);
        objects.push(new GravityObject(position, velocity, mass));
    }
    return objects;
}

function spawnTrinarySystem() {
    let objects = [];
    objects.push(new GravityObject(new Point3D(1.5, 0.0, 1.0),
                                   new Point3D(0.0, 0.05, 0.0),
                                   1.0e8));
    objects.push(new GravityObject(new Point3D(-1.5, 0.0, -1.0),
                                   new Point3D(0.0, -0.05, 0.0),
                                   1.0e8));
    objects.push(new GravityObject(new Point3D(0.0, 0.0, 0.0),
                                   new Point3D(0.0, 0.0, 0.0),
                                   1.25e8));
    return objects;
}

function runSimulation(timePassed = 0) {
    if (isRunning) {
        simulation.updatePositions();
        renderSimulation(simulation);
    }
    requestAnimationFrame(runSimulation);
}

// TODO: Refactor UI code into separate file?
// UI Code
function getNum(id){ /* gets the number from the GUI using the id */
    return eval(document.getElementById(id).value) ;
}

document.addEventListener('click', function(event) {
    if (!event.target.matches('#run')) {
        return;
    }

    event.preventDefault();
    isRunning = !isRunning;
});

document.addEventListener('click', function(event) {
    if (!event.target.matches('#restart')) {
        return;
    }

    event.preventDefault();
    initSimulation();
});