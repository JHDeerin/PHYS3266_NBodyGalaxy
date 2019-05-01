/**
 * Contains functions/classes related to rendering the simulation on the screen
 */

import { Point3D } from './simulationClasses.js';
import {Plot} from './AkPlot.js';
import {totalEnergy,totalAngMomentum} from './barnesHutTree.js'

let canvas = null;
let canvas1 = null;
let canvas2 = null;
let ctx = null;
let cameraZ = -6.0e20;
let MAX_STAR_DISTANCE = 1.0e21;

var plt1 = null;
var plt2 = null;
var Energycurve = null ; 
var AngMomentumcurve = null ;
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
    canvas1 = document.getElementById('Energy-canvas');
    canvas2 = document.getElementById('AngMomentum-canvas');
    updateCanvasSize(canvas);
    updateCanvasSize(canvas1);
    updateCanvasSize(canvas2);
    ctx = canvas.getContext('2d');

    MAX_STAR_DISTANCE = screenWidthRealDist;
    cameraZ = -cameraDist;
    initializePlots();
}

function updateCanvasSize(canvas) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}
function initializePlots(){
    plt1 = new Plot(canvas1);
    plt1.ylimits=[0,1e39] ;
    plt1.xlimits=[0,9e12];
    plt1.grid = 'on' ;
    plt1.xticks.noDivs = 5 ;
    plt1.yticks.noDivs = 4 ;
    plt1.margins.right = 20 ;
    plt1.xticks.precision = 0 ;
    plt1.yticks.precision = 0 ;
    plt1.xlabel = 'Time' ;
    plt1.ylabel = 'Energy' ;
    plt1.legend.location = [430,20] ;

    plt2 = new Plot(canvas2);
    plt2.ylimits=[0,1e30] ;
    plt2.xlimits=[0,9e11] ;
    plt2.grid = 'on' ;
    plt2.xticks.noDivs = 5 ;
    plt2.yticks.noDivs = 4 ;
    plt2.margins.right = 20 ;
    plt2.xticks.precision = 0 ;
    plt2.yticks.precision = 0 ;
    plt2.xlabel = 'time' ;
    plt2.ylabel = 'Angular Momentum' ;
    plt2.legend.location = [430,20] ;

    Energycurve = plt1.addCurveFromPoints() ;
    AngMomentumcurve = plt2.addCurveFromPoints() ;

    Energycurve.name = 'T+U'
    AngMomentumcurve.name = 'L'
}

// TODO: Properly implement this
function renderSimulation(sim, simulation_time) {
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < sim.objects.length; i++) {
        if(getWavelength(sim.objects[i].mass)>=380 && getWavelength(sim.objects[i].mass)<=780) {
             ctx.fillStyle = wavelengthToColor(getWavelength(sim.objects[i].mass)) ;
        }
        else{
            ctx.fillStyle = 'white';
        }
        const currentPos = sim.objects[i].location;
        const screenPos = toScreenCoordinates(currentPos);

        if (screenPos.x > 0 && screenPos.y > 0
                && screenPos.x < canvas.width
                && screenPos.y < canvas.height) {
            // Poor man's 3D scaling calculation for a camera at negative Z
            const scaling = Math.abs(cameraZ) / 10.0;
            const zScale = (currentPos.z - cameraZ) / scaling;
            let squareSize = (zScale > 0) ? 50.0 / zScale : 0;
            ctx.fillRect(screenPos.x, screenPos.y, squareSize, squareSize);
        }
    }
     Energycurve.draw(simulation_time,totalEnergy(sim));
     AngMomentumcurve.draw(simulation_time,totalAngMomentum(sim));
}

function wavelengthToColor(wavelength) {
var R,
        G,
        B,
        alpha,
        colorSpace,
        wl = wavelength,
        gamma = 1;


    if (wl >= 380 && wl < 440) {
        R = -1 * (wl - 440) / (440 - 380);
        G = 0;
        B = 1;
   } else if (wl >= 440 && wl < 490) {
       R = 0;
       G = (wl - 440) / (490 - 440);
       B = 1;  
    } else if (wl >= 490 && wl < 510) {
        R = 0;
        G = 1;
        B = -1 * (wl - 510) / (510 - 490);
    } else if (wl >= 510 && wl < 580) {
        R = (wl - 510) / (580 - 510);
        G = 1;
        B = 0;
    } else if (wl >= 580 && wl < 645) {
        R = 1;
        G = -1 * (wl - 645) / (645 - 580);
        B = 0.0;
    } else if (wl >= 645 && wl <= 780) {
        R = 1;
        G = 0;
        B = 0;
    } else {
        R = 0;
        G = 0;
        B = 0;
    }

    // intensty is lower at the edges of the visible spectrum.
    if (wl > 780 || wl < 380) {
        alpha = 0;
    } else if (wl > 700) {
        alpha = (780 - wl) / (780 - 700);
    } else if (wl < 420) {
        alpha = (wl - 380) / (420 - 380);
    } else {
        alpha = 1;
    }

   return colorSpace = ["rgba(" + (R * 100) + "%," + (G * 100) + "%," + (B * 100) + "%, " + alpha + ")"]
   
}

function getWavelength(objMass){
    let L = 3.828e26 * Math.pow(objMass/1.9885e30, 3.5);

    let R = Math.pow((3*objMass)/(4*Math.PI *1.41e3),1/3);

    let T = Math.pow(L/(4*Math.PI*5.670e-8*Math.pow(R,2)),1/4);

    let lambda = 2.9e6/T;
    return lambda
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