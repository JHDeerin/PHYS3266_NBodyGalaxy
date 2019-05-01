/**
 * Contains classes/utilities needed to run the physical simulation
 */

 import { BarnesHutTree, TreeNode } from './barnesHutTree.js';
 //TODO: Might need to break this apart further into multiple files?

/**
 * Holds list of body objects and updates their positions
 */
class GravityCalculator {
    constructor(objectList, gravConstant, dt, theta=0.5) {
        this.objects = objectList;
        this.bigG = gravConstant;
        this.dt = dt;
        this.theta = theta;
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
            let locationChange = velocities1[i].add(
                                    velocities2[i].mult(2.0)).add(
                                    velocities3[i].mult(2.0)).add(
                                    velocities4[i]).div(6.0);
            this.objects[i].location = this.objects[i].location.add(locationChange);

            let velocityChange = accels1[i].add(
                                    accels2[i].mult(2.0)).add(
                                    accels3[i].mult(2.0)).add(
                                    accels4[i]).div(6.0);
            this.objects[i].velocity = this.objects[i].velocity.add(velocityChange);
        }
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

    /**
     * Returns a list of the net forces acting on each object in the simulation
     * 
     * @param positionOffsets Any offsets for the "ith" object to add to its
     * actual position during force calculations (needed for RK4 integration)
     */
    getForceList(positionOffsets) {
        const barnesHutTree = new BarnesHutTree(this.objects, positionOffsets);
        // calculate the total force acting on each object
        let forces = [];
        for (let i = 0; i < this.objects.length; i++) {
            const force = barnesHutTree.getNetForceOnObject(this.objects[i],
                                                            this.bigG,
                                                            positionOffsets[i],
                                                            this.theta);
            forces.push(force);
        }
        return forces;
    }

    mergeCollidingObjects(collisionDist) {
        // TODO: Try to merge this w/ last RK4 tree to avoid 5 tree constructions per timestep?
        const collisionTree = new BarnesHutTree(this.objects);
        collisionTree.markCollisions(collisionDist, this.theta);

        let newObjects = [];
        let objectCounter = 0;
        for (let i = 0; i < this.objects.length; i++) {
            if (!this.objects[i].hasBeenMerged) {
                if (this.objects[i].colliding.size == 0) {
                    // object isn't colliding, so we can just re-add it
                    this.objects[i].id = objectCounter;
                    newObjects.push(this.objects[i]);
                    objectCounter++;
                } else {
                    // Object hasn't been merged yet, so let's merge it
                    this.objects[i].hasBeenMerged = true;
                    let newMergedObj = this.getMergedObject(this.objects[i]);

                    newMergedObj.id = objectCounter;
                    newObjects.push(newMergedObj);
                    objectCounter++;
                }
            }
        }

        this.objects = newObjects;
    }

    getMergedObject(object) {
        let toBeMerged = [object];
        const collidingIDs = Array.from(object.colliding);

        for (let i = 0; i < collidingIDs.length; i++) {
            const currentID = collidingIDs[i]
            if (!this.objects[currentID].hasBeenMerged) {
                this.objects[currentID].hasBeenMerged = true;
                toBeMerged.push(this.objects[currentID]);
            }
        }

        let totalMass = toBeMerged.reduce((sum, obj) => sum + obj.mass, 0);
        let centerOfMass = new Point3D(0.0, 0.0, 0.0);
        let newVelocity = new Point3D(0.0, 0.0, 0.0);
        for (let i = 0; i < toBeMerged.length; i++) {
            centerOfMass = centerOfMass.add(toBeMerged[i].location.mult(toBeMerged[i].mass));
            newVelocity = newVelocity.add(toBeMerged[i].velocity.mult(toBeMerged[i].mass));
        }
        centerOfMass = centerOfMass.div(totalMass);
        newVelocity = newVelocity.div(totalMass);

        return new GravityObject(centerOfMass, newVelocity, totalMass, 0);
    }
}

/**
 * An object that can affect/is affected by gravity
 */
class GravityObject {
    constructor(location, velocity, mass, id) {
        this.location = location;
        this.velocity = velocity;
        this.mass = mass;
        this.id = id;   //ID is assumed to match object's index in list

        this.colliding = new Set();
        this.hasBeenMerged = false;
    }

    calcAcceleration(forceVect) {
        return forceVect.div(this.mass);
    }

    calcVelocity(accelerationVect = null) {
        if (!accelerationVect) {
            return this.velocity;
        }
        return this.velocity.add(accelerationVect);
    }

    addCollidingObject(collidingID) {
        if (this.id !== collidingID) {
            this.colliding.add(collidingID);
        }
    }
}

/**
 * A point or vector in 3D space (NOTE: Operations all return new COPIES of
 * the point, instead of altering the point itself)
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

    cross(otherPoint) {
        return new Point3D(this.y*otherPoint.z - this.z*otherPoint.y,
                            this.z*otherPoint.x - this.x*otherPoint.z,
                            this.x*otherPoint.y - this.y*otherPoint.x);
    }

    normalize() {
        const length = this.magnitude();
        return this.div(length);
    }

    magnitude() {
        return Math.sqrt(this.x**2 + this.y**2 + this.z**2);
    }
}

export { GravityCalculator, GravityObject, Point3D };