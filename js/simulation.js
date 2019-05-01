// TODO: Holy cow, this whole thing is in MAJOR need of refactoring

import { initCanvas, renderSimulation } from './drawing.js';
import { GravityCalculator, GravityObject, Point3D } from './simulationClasses.js';
import {totalEnergy, totalAngMomentum} from './barnesHutTree.js';

// TODO: Refactor this/expose it all to the UI
let simulation = null;
let isRunning = true;
var simulation_time = 0;

initSimulation();
runSimulation();

function initSimulation() {
    const LIGHT_YEAR_METERS = 9.461e15;
    initCanvas(getNum('screenWidth')*LIGHT_YEAR_METERS, getNum('cameraDist')*LIGHT_YEAR_METERS);

    //TODO: Separate out UI code from this if possible
    const numObj = getNum('numObj');
    const galaxyRadius = getNum('maxDist');
    const maxSpeed = getNum('maxSpeed');

    const bigG = getNum('bigG');
    const dt = getNum('dt');
    const theta = getNum('theta');

    let objects = spawnRandomObjects(numObj, galaxyRadius*LIGHT_YEAR_METERS, maxSpeed);
    setMass(objects, getNum('minMass'), getNum('maxMass'));
    setOrbitVel(objects, bigG); //TODO: Make velocity setting an option (this function currently overwrites UI velocity setting)
    //let objects = spawnTrinarySystem();
    

    simulation = new GravityCalculator(objects, bigG, dt, theta);

    simulation_time = 0;

    // Render sim so restarting while paused doesn't leave a blank canvas
    renderSimulation(simulation);
}

function spawnRandomObjects(numObjects, maxDist, maxVelocity) {
    let objects = [];

    for (let i = 0; i < numObjects; i++) {
        let position = new Point3D(randRange(-maxDist, maxDist),
                                   randRange(-maxDist, maxDist),
                                   randRange(-maxDist, maxDist));

        let velocity = new Point3D(randRange(-maxVelocity, maxVelocity),
                                   randRange(-maxVelocity, maxVelocity),
                                   randRange(-maxVelocity, maxVelocity));
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

function setMass(objects, minMass, maxMass) {
    for (let i = 0; i < objects.length; i++) {
        const mass = randRange(minMass, maxMass);
        objects[i].mass = mass;
    }
}

function setOrbitVel(objects, bigG) {
    let totalMass = 0.0;
    let centerOfMass = new Point3D(0.0, 0.0, 0.0);
    for (let i = 0; i < objects.length; i++) {
        totalMass += objects[i].mass;
        centerOfMass = centerOfMass.add(objects[i].location);
    }
    centerOfMass = centerOfMass.div(objects.length);

    for (let i = 0; i < objects.length; i++) {
        // get vector pointing along perpendicular orbit around the origin
        const towardsCenter = centerOfMass.sub(objects[i].location);
        const otherVector = (towardsCenter.x == 0.0) ? new Point3D(1.0, 0.0, 0.0) : new Point3D(0.0, 0.0, -1.0);
        const velVector = towardsCenter.cross(otherVector).normalize();

        const radius = towardsCenter.magnitude();
        const orbitSpeed = Math.sqrt(bigG * totalMass / radius);

        objects[i].velocity = velVector.mult(orbitSpeed / 2.0);
    }
}

function randRange(min, max) {
    return Math.random()*(max - min) + min;
}

function runSimulation(timePassed = 0) {
    if (isRunning) {
        simulation.updatePositions();
        renderSimulation(simulation,simulation_time);
        simulation_time += simulation.dt;
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

export {getNum} ;