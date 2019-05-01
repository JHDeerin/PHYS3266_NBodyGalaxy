/**
 * Classes related to implementing the Barnes-Hut algorithm for speeding up
 * spatial distance calculations (see here: http://arborjs.org/docs/barnes-hut)
 */

import { Point3D, GravityObject } from './simulationClasses.js';

/**
 * Constructs and holds the overall oct-tree of objects 
 */
class BarnesHutTree {
    constructor(objectList, positionOffsets=null) {
        this.rootNode = this.buildNewTree(objectList, positionOffsets);
        this.objects = objectList;
    }

    // TODO: Refactor so position offsets are passed in more cleanly?
    buildNewTree(objectList, positionOffsets) {
        //max box size will be equal to the maximum distance away from the origin
        let maxDistance = 0;
        for(let i = 0; i < objectList.length; i++) {
            const distance = objectList[i].location.magnitude();
            maxDistance = (distance > maxDistance) ? distance : maxDistance;
        }

        const originPos = new Point3D(0.0, 0.0, 0.0);
        let root = new TreeNode(maxDistance, originPos, 0);
        for (let i = 0; i < objectList.length; i++) {
            // if no position offsets, just use (0,0,0) (i.e. no offset)
            const posOffset = (positionOffsets) ? positionOffsets[i] : originPos;
            root.addObject(objectList[i], posOffset);
        }
        return root;
    }

    getNetForceOnObject(object, bigG, positionOffset, theta=0.5) {
        return this.rootNode.getNetForceOnObject(object, bigG, positionOffset, theta);
    }

    markCollisions(collisionDist, theta=0.5) {
        for (let i = 0; i < this.objects.length; i++) {
            this.rootNode.markCollidingObjects(this.objects[i], collisionDist, theta);
        }
    }
}

class TreeNode {
    constructor(nodeSize, nodePosition, depth) {
        this.size = nodeSize;
        this.pos = nodePosition;
        this.depth = depth;

        this.maxDepth = 100; //TODO: Pass this as an argument, or define as a static var?
        this.totalMass = 0;
        this.numChildObjects = 0;
        this.children = [];
        this.centerOfMass = new Point3D(0.0, 0.0, 0.0);
    }

    // NOTE: Assumes that the collision distance is smaller than the minimum
    // distance for calculating gravity
    /**
     * Adds the IDs of any objects close enough to collide w/ the given object
     * to that object's "colliding" list
     */
    markCollidingObjects(object, collisionDist, theta) {
        if (this.numChildObjects == 0) {
            // No objects, so no collisions to check
            return;
        }

        const forceVector = this.centerOfMass.sub(object.location);
        let distance = forceVector.magnitude();

        // Calculate if objects should be merged
        if ((this.numChildObjects == 1) && distance < collisionDist) {
            for (let i = 0; i < this.children.length; i++) {
                object.addCollidingObject(this.children[i].obj.id);
                this.children[i].obj.addCollidingObject(object.id);
            }
        }

        const distanceFactor = distance / this.size;
        if (distanceFactor < theta 
            || this.numChildObjects == 1
            || this.depth == this.maxDepth) {
            // can't recurse any further, so just stop
            return;
        }

        // otherwise, check all our children for collisions
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].markCollidingObjects(object, collisionDist, theta);
        }
    }

    getNetForceOnObject(object, bigG, positionOffset, theta) {
        let netForce = new Point3D(0.0, 0.0, 0.0);
        if (this.numChildObjects == 0) {
            // No objects, so this won't exert any force
            return netForce;
        }

        const forceVector = this.centerOfMass.sub(object.location.add(positionOffset));
        let distance = forceVector.magnitude();
        if (distance < 1.0e-5) {
            // likely computing force against self, so don't exert any force
            return netForce;
        }

        // If far enough away (or we're at the bottom of the tree), approximate
        // gravitation force w/ this node's center of mass
        const distanceFactor = distance / this.size;
        distance += (6.0e7)**2; //TODO: Make this a variable (adds relaxation constant so near collisions don't "blow up")
        if (distanceFactor < theta 
                || this.numChildObjects == 1
                || this.depth == this.maxDepth) {
            // Object is far enough away that we can use center-of-mass
            const numerator = bigG*this.totalMass*object.mass;
            return forceVector.normalize().mult(numerator).div(distance ** 2);
        }

        // Otherwise, include all our children in the force calculation
        for (let i = 0; i < this.children.length; i++) {
            netForce = netForce.add(this.children[i].getNetForceOnObject(object, bigG, positionOffset, theta));
        }
        return netForce;
    }

    addObject(newObject, positionOffset) {
        //TODO: Find a better way of avoiding stack overflow errors than capping the tree depth?
        if (this.numChildObjects == 0 || this.depth >= this.maxDepth) {
            //TODO: Making this an object is somewhat arbitrary?
            this.children.push({obj: newObject, offset: positionOffset});
        } else if (this.numChildObjects == 1) {
            // need to create 8 new empty nodes
            const existingObject = this.children[0];
            this.children = this.createChildNodes();

            // add object we were already storing
            const existingOctantIndex = this.getOctantIndex(existingObject.obj.location.add(existingObject.offset));
            this.children[existingOctantIndex].addObject(existingObject.obj,
                                                         existingObject.offset);

            // add new object
            const newOctantIndex = this.getOctantIndex(newObject.location.add(positionOffset));
            this.children[newOctantIndex].addObject(newObject, positionOffset);
        } else {
            //just add the new object
            const newOctantIndex = this.getOctantIndex(newObject.location.add(positionOffset));
            this.children[newOctantIndex].addObject(newObject, positionOffset);
        }
        this.updateCenterOfMass(newObject, positionOffset);
        this.numChildObjects += 1;
    }

    // TODO: Change this to be calculated recursively AFTER the tree is built,
    // instead of when each object is added? (unsure of the performance diff)
    updateCenterOfMass(newObject, positionOffset) {
        this.centerOfMass = this.centerOfMass.mult(this.totalMass).add(
            newObject.location.add(positionOffset).mult(newObject.mass));
        this.totalMass += newObject.mass;
        this.centerOfMass = this.centerOfMass.div(this.totalMass);
    }

    // TODO: Find a way of sharing the child ordering information?
    // Creates 8 new child nodes for the oct-tree
    createChildNodes() {
        const childSize = this.size / 2.0;
        const newDepth = this.depth + 1;
        let childNodes = [];

        //TODO: Refactor this as a for-loop, somehow?
        const topNorthWestOffset = new Point3D(-childSize, childSize, childSize);
        childNodes.push(new TreeNode(childSize, this.pos.add(topNorthWestOffset), newDepth));

        const topNorthEastOffset = new Point3D(childSize, childSize, childSize);
        childNodes.push(new TreeNode(childSize, this.pos.add(topNorthEastOffset), newDepth));

        const topSouthEastOffset = new Point3D(childSize, -childSize, childSize);
        childNodes.push(new TreeNode(childSize, this.pos.add(topSouthEastOffset), newDepth));

        const topSouthWestOffset = new Point3D(-childSize, -childSize, childSize);
        childNodes.push(new TreeNode(childSize, this.pos.add(topSouthWestOffset), newDepth));

        const bottomNorthWestOffset = new Point3D(-childSize, childSize, -childSize);
        childNodes.push(new TreeNode(childSize, this.pos.add(bottomNorthWestOffset), newDepth));

        const bottomNorthEastOffset = new Point3D(childSize, childSize, -childSize);
        childNodes.push(new TreeNode(childSize, this.pos.add(bottomNorthEastOffset), newDepth));

        const bottomSouthEastOffset = new Point3D(childSize, -childSize, -childSize);
        childNodes.push(new TreeNode(childSize, this.pos.add(bottomSouthEastOffset), newDepth));

        const bottomSouthWestOffset = new Point3D(-childSize, -childSize, -childSize);
        childNodes.push(new TreeNode(childSize, this.pos.add(bottomSouthWestOffset), newDepth));

        return childNodes;
    }


    /**
     * Returns the index of the octant the given position is in, relative to the
     * center of the node (order should be starting at the top-left and going
     * clockwise, first for the top 4 cubes, then the bottom 4 cubes)
     * 
     * @param pos 
     */
    getOctantIndex(pos) {
        const xIsLess = pos.x < this.pos.x;
        const yIsLess = pos.y < this.pos.y;
        const zIsLess = pos.z < this.pos.z;
        if (xIsLess && !yIsLess && !zIsLess) { // Top North-West
            return 0;
        } else if (!xIsLess && !yIsLess && !zIsLess) { // Top North-East
            return 1;
        } else if (!xIsLess && yIsLess && !zIsLess) { // Top South-East
            return 2;
        } else if (xIsLess && yIsLess && !zIsLess) { // Top South-West
            return 3;
        } else if (xIsLess && !yIsLess && zIsLess) { // Bottom North-West
            return 4;
        } else if (!xIsLess && !yIsLess && zIsLess) { // Bottom North-East
            return 5;
        } else if (!xIsLess && yIsLess && zIsLess) { // Bottom South-East
            return 6;
        }
        return 7; // Bottom South-West (and default)
    }
}

function totalEnergy(sim) {
    var U = 0;
    for(var i=0;i<sim.objects.length;i++){
        for(var j=0;j<sim.objects.length;j++){
            let dvector = sim.objects[i].location.sub(sim.objects[j].location);
            if (dvector.magnitude() ==0){
                continue;
            }
            U = U - (sim.bigG*sim.objects[i].mass*sim.objects[j].mass)/(dvector.magnitude());
        }
    }
    var T = sim.objects.reduce(function(totalKineticE,c){return totalKineticE + (1./2.)*c.mass*Math.pow(c.velocity.magnitude(),2)},0);
    console.log(T-(1/2)*U);
    return (T - (1./2.)*U);
}
    

function totalAngMomentum(sim) {
    var A = sim.objects.reduce(function(totalAngMoment,d){return totalAngMoment + d.location.cross(d.mass*d.velocity).magnitude()},0);
    
    return A;
}


export { BarnesHutTree, TreeNode, totalEnergy, totalAngMomentum };