/**
 * Contains functions/classes related to rendering the simulation on the screen
 */

import { Point3D } from './simulationClasses.js';

let canvas = null;
let ctx = null;

function drawPlaceholderMessage() {
    initCanvas();

    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white';
    ctx.font = '24px serif';
    ctx.fillText('(Imagine Awesome Things Here)', canvas.width/2 - 150, canvas.height/2);
}

function initCanvas() {
    canvas = document.getElementById('sim-canvas');
    updateCanvasSize(canvas);
    ctx = canvas.getContext('2d');
}

function updateCanvasSize(canvas) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

// TODO: Properly implement this
function renderSimulation(sim) {
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    for (let i = 0; i < sim.objects.length; i++) {
        const currentPos = sim.objects[i].location;
        const screenPos = toScreenCoordinates(currentPos);

        if (screenPos.x > 0 && screenPos.y > 0
                && screenPos.x < canvas.width
                && screenPos.y < canvas.height) {
            // Poor man's 3D calculation for a camera at Z=-3 (in sim space)
            const cameraZ = -3.0;
            const zScale = (currentPos.z - cameraZ);
            let squareSize = (zScale > 0) ? 50.0 / zScale : 0;
            ctx.fillRect(screenPos.x, screenPos.y, squareSize, squareSize);
        }
    }
}

/**
 * Returns a 2D point with the pixel coordinates of the given 3D point
 */
function toScreenCoordinates(point) {
    // [-2.0, 2.0] => [0, canvasWidth]
    const screenX = (point.x + 2.0) * canvas.width / 4.0;
    const screenY = (point.y + 2.0) * canvas.height / 4.0;
    return new Point3D(Math.floor(screenX), Math.floor(screenY), 0);
}

export { initCanvas, renderSimulation };