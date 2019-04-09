// TODO: Holy cow, this whole thing is in MAJOR need of refactoring

import { initCanvas, renderSimulation } from './drawing.js';
import { GravityCalculator, GravityObject, Point3D } from './simulationClasses.js';

//==============================================================================

// TODO: Refactor this/expose it all to the UI
let simulation = null;

//drawPlaceholderMessage();
initSimulation();
runSimulation();

function initSimulation() {
    initCanvas();

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
    simulation = new GravityCalculator(objects, 6.6738e-11, 1.0);
}

function runSimulation(timePassed = 0) {
    simulation.updatePositions();
    renderSimulation(simulation);
    requestAnimationFrame(runSimulation);
}