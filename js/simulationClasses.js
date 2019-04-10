/**
 * Contains classes/utilities needed to run the physical simulation
 */

 import { BarnesHutTree, TreeNode } from './barnesHutTree.js';
 //TODO: Might need to break this apart further into multiple files?

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
        let forces = this.getForceList(positionOffsets);
        for (let i = 0; i < this.objects.length; i++) {
            const accel = this.objects[i].calcAcceleration(forces[i]);
            accelerations.push(accel);
        }
        return accelerations.map(a => a.mult(this.dt));
    }

    /**
     * Returns a list of the total force acting on each object in the simulation
     * 
     * @param positionOffsets Any offsets for the "ith" object to add to its
     * actual position during force calculations (needed for RK4 integration)
     */
    getForceList(positionOffsets) {
        // TODO: Currently O(N^2), update this for efficiency

        const barnesHutTree = new BarnesHutTree(this.objects, positionOffsets);
        // calculate the total force acting on each object
        let forces = [];
        for (let i = 0; i < this.objects.length; i++) {
            const force = barnesHutTree.getNetForceOnObject(this.objects[i],
                                                            this.bigG,
                                                            positionOffsets[i],
                                                            0.5);
            forces.push(force);
        }
        return forces;
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

    div(scalar) {
        return new Point3D(this.x / scalar,
                           this.y / scalar,
                           this.z / scalar);
    }

    normalize() {
        const length = this.magnitude();
        return this.mult(1.0 / length);
    }

    magnitude() {
        return Math.sqrt(this.x**2 + this.y**2 + this.z**2);
    }
}

export { GravityCalculator, GravityObject, Point3D };