// TODO: Actually implement the simulation, instead of a test of the canvas

drawPlaceholderMessage();

function drawPlaceholderMessage() {
    canvas = document.getElementById('sim-canvas');
    updateCanvasSize(canvas);
    ctx = canvas.getContext('2d');

    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white';
    ctx.font = '24px serif';
    ctx.fillText('(Imagine Awesome Things Here)', canvas.width/2 - 150, canvas.height/2);
}

function updateCanvasSize(canvas) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}