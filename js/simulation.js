// TODO: Holy cow, this whole thing is in MAJOR need of refactoring

/**
 * Holds list of body objects and updates their positions
 */
class GravityCalculator {
    constructor(objectList, gravConstant, dt) {
        this.objects = objectList;
        this.bigG = gravConstant;
        this.dt = dt;
    }

    /**
     * Update all object positions by 1 timestep using Runge-Kutta (RK4)
     */
    updatePositions() {
        const accels1 = this.getAccelList();
        const velocities1 = this.getVelocityList();

        const accels2 = this.getAccelList(velocities1, true);
        const velocities2 = this.getVelocityList(accels1, true);

        const accels3 = this.getAccelList(velocities2, true);
        const velocities3 = this.getVelocityList(accels2, true);

        const accels4 = this.getAccelList(velocities3, false);
        const velocities4 = this.getVelocityList(accels3, false);

        for (let i = 0; i < this.objects.length; i++) {
            //TODO: Use vector adding functions
            let locationChange = velocities1[i].add(
                                    velocities2[i].mult(2.0)).add(
                                    velocities3[i].mult(2.0)).add(
                                    velocities4[i]).mult(1.0 / 6.0);
            this.objects[i].location = this.objects[i].location.add(locationChange);

            let velocityChange = accels1[i].add(
                                    accels2[i].mult(2.0)).add(
                                    accels3[i].mult(2.0)).add(
                                    accels4[i]).mult(1.0 / 6.0);
            this.objects[i].velocity = this.objects[i].velocity.add(velocityChange);
        }
    }

    getVelocityList(velocityOffsets = null, offsetByHalf = false) {
        // if no offsets provided, assume all offsets are 0
        if (!velocityOffsets) {
            velocityOffsets = [];
            for (let i = 0; i < this.objects.length; i++) {
                velocityOffsets.push(new Point3D(0.0, 0.0, 0.0));
            }
        }
        // divide each offset in half if option set
        if (offsetByHalf) {
            let newOffsets = [];
            for (let i = 0; i < this.objects.length; i++) {
                newOffsets.push(velocityOffsets[i].mult(0.5));
            }
            velocityOffsets = newOffsets;
        }

        let velocities = [];
        for (let i = 0; i < this.objects.length; i++) {
            velocities.push(this.objects[i].calcVelocity(velocityOffsets[i]))
        }
        return velocities.map(v => v.mult(this.dt));
    }

    getAccelList(positionOffsets = null, offsetByHalf = false) {
        // if no offsets provided, assume all offsets are 0
        if (!positionOffsets) {
            positionOffsets = [];
            for (let i = 0; i < this.objects.length; i++) {
                positionOffsets.push(new Point3D(0.0, 0.0, 0.0));
            }
        }
        // divide each offset in half if option set
        if (offsetByHalf) {
            let newOffsets = [];
            for (let i = 0; i < this.objects.length; i++) {
                newOffsets.push(positionOffsets[i].mult(0.5));
            }
            positionOffsets = newOffsets;
        }

        let accelerations = [];
        let forces = this.getForceList(positionOffsets, offsetByHalf);
        for (let i = 0; i < this.objects.length; i++) {
            const accel = this.objects[i].calcAcceleration(forces[i]);
            accelerations.push(accel);
        }
        return accelerations.map(a => a.mult(this.dt));
    }

    getForceList(positionOffsets) {
        // TODO: Currently O(N^2), update this for efficiency

        // calculate the total force acting on each object
        let forces = [];
        for (let i = 0; i < this.objects.length; i++) {
            let force = new Point3D(0.0, 0.0, 0.0);
            const currentPos = this.objects[i].location.add(positionOffsets[i]);
            const currentMass = this.objects[i].mass
            for (let j = 0; j < this.objects.length; j++) {
                const isSameObject = i == j;
                if (!isSameObject) {
                    const otherPos = this.objects[j].location.add(positionOffsets[j]);
                    const otherMass = this.objects[j].mass;

                    const newForce = this.calcForce(currentPos, currentMass, otherPos, otherMass);
                    force = force.add(newForce);
                }
            }
            forces.push(force);
        }
        return forces;
    }

    calcForce(obj1Pos, obj1Mass, obj2Pos, obj2Mass) {
        const forceVector = obj2Pos.sub(obj1Pos);
        const distance = forceVector.magnitude();

        const numerator = this.bigG*obj1Mass*obj2Mass;
        return forceVector.normalize().mult(numerator / (distance ** 2))
    }
}

/**
 * An object that can affect/is affected by gravity
 */
class GravityObject {
    constructor(location, velocity, mass) {
        this.location = location;
        this.velocity = velocity;
        this.mass = mass;
    }

    calcAcceleration(forceVect) {
        return forceVect.mult(1.0 / this.mass);
    }

    calcVelocity(accelerationVect = null) {
        if (!accelerationVect) {
            return this.velocity;
        }
        return this.velocity.add(accelerationVect);
    }
}

/**
 * A point or vector in 3D space
 */
class Point3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(otherPoint) {
        return new Point3D(this.x + otherPoint.x,
                           this.y + otherPoint.y,
                           this.z + otherPoint.z);
    }

    sub(otherPoint) {
        return new Point3D(this.x - otherPoint.x,
                           this.y - otherPoint.y,
                           this.z - otherPoint.z);
    }

    mult(scalar) {
        return new Point3D(this.x * scalar,
                           this.y * scalar,
                           this.z * scalar);
    }

    normalize() {
        const length = this.magnitude();
        return this.mult(1.0 / length);
    }

    magnitude() {
        return Math.sqrt(this.x**2 + this.y**2 + this.z**2);
    }
}

//==============================================================================

// TODO: Refactor this/expose it all to the UI
let simulation = null;
let canvas = null;
let ctx = null;

//drawPlaceholderMessage();
initSimulation();
runSimulation();

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
            ctx.fillRect(screenPos.x, screenPos.y, 10, 10);
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

function initSimulation() {
    initCanvas();

    objects = [];
    objects.push(new GravityObject(new Point3D(1.5, 0.0, 0.0),
                                   new Point3D(0.0, 0.05, 0.0),
                                   1.0e8));
    objects.push(new GravityObject(new Point3D(-1.5, 0.0, 0.0),
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