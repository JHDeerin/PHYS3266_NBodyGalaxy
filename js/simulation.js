// TODO: Holy cow, this whole thing is in MAJOR need of refactoring

import { initCanvas, renderSimulation } from './drawing.js';
import { GravityCalculator, GravityObject, Point3D } from './simulationClasses.js';

// TODO: Refactor this/expose it all to the UI
let simulation = null;

initSimulation();
runSimulation();

function initSimulation() {
    initCanvas();

    let objects = spawnRandomObjects(500);
    //let objects = spawnTrinarySystem();
    simulation = new GravityCalculator(objects, 6.6738e-11, 1.0);
}

function spawnRandomObjects(numObjects) {
    let objects = [];
    function randRange(min, max) {
        return Math.random()*(max - min) + min;
    }

    for (let i = 0; i < numObjects; i++) {
        let position = new Point3D(randRange(-1.5, 1.5),
                                   randRange(-1.5, 1.5),
                                   randRange(-1.5, 1.5));
        let velocity = new Point3D(randRange(-0.05, 0.05),
                                   randRange(-0.05, 0.05),
                                   randRange(-0.05, 0.05));
        let mass = randRange(1.0e7, 5.0e7);
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
    simulation.updatePositions();
    renderSimulation(simulation);
    requestAnimationFrame(runSimulation);
}