/**
 * Contains functions/classes related to rendering the simulation on the screen
 */

import { Point3D } from './simulationClasses.js';

let canvas = null;
let ctx = null;
let cameraZ = -6.0e20;
let MAX_STAR_DISTANCE = 1.0e21;

function drawPlaceholderMessage() {
    initCanvas();

    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white';
    ctx.font = '24px serif';
    ctx.fillText('(Imagine Awesome Things Here)', canvas.width/2 - 150, canvas.height/2);
}

function initCanvas(screenWidthRealDist, cameraDist) {
    canvas = document.getElementById('sim-canvas');
    updateCanvasSize(canvas);
    ctx = canvas.getContext('2d');

    MAX_STAR_DISTANCE = screenWidthRealDist;
    cameraZ = -cameraDist;
}

function updateCanvasSize(canvas) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

// TODO: Properly implement this
function renderSimulation(sim) {
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    for (let i = 0; i < sim.objects.length; i++) {
        const currentPos = sim.objects[i].location;
        const screenPos = toScreenCoordinates(currentPos);

        if (screenPos.x > 0 && screenPos.y > 0
                && screenPos.x < canvas.width
                && screenPos.y < canvas.height) {
            // Poor man's 3D calculation for a camera at Z=-6.0e20 (in sim space)
            const scaling = Math.abs(cameraZ) / 10.0;
            const zScale = (currentPos.z - cameraZ) / scaling;
            let squareSize = (zScale > 0) ? 50.0 / zScale : 0;
            ctx.fillRect(screenPos.x, screenPos.y, squareSize, squareSize);
        }
    }
}

/**
 * Returns a 2D point with the pixel coordinates of the given 3D point
 */
function toScreenCoordinates(point) {
    // [-MAX_STAR_DISTANCE, MAX_STAR_DISTANCE] => [0, canvasWidth]
    const screenX = (point.x + MAX_STAR_DISTANCE) * canvas.width / (2.0 * MAX_STAR_DISTANCE);
    const screenY = (point.y + MAX_STAR_DISTANCE) * canvas.height / (2.0 * MAX_STAR_DISTANCE);
    return new Point3D(Math.floor(screenX), Math.floor(screenY), 0);
}

export { initCanvas, renderSimulation };