// TODO: Actually implement the simulation, instead of a test of the canvas

canvas = document.getElementById('sim-canvas');
updateCanvasSize(canvas);
ctx = canvas.getContext('2d');

ctx.fillStyle = 'green';
ctx.fillRect(0, 0, canvas.width, canvas.height)

function updateCanvasSize(canvas) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}