import { readFileSync } from 'fs';
const CSV_SEP = /\s*\,\s*/;

/**
 * A classification DB.
 * Martin Cowie - 2021
 */

type Dictionary = {[key: string]: string};
type LeafHandler = (nameParts: string[]) => void;
export type DAGNode = {[parentName: string] : any};

/**
 * Build a DAG of objects from CSV parent->child relationship data, from a file.
 * @param filename
 */
export function fromFile(filename: string): Object {
    // Quick & dirty
    const lines = readFileSync(filename)
        .toString()
        .trim()
        .split('\n');

    lines.shift(); // Skip header line

    return from(lines);
}


/**
 * Build a DAG of nodes from CSV parent->child relationship data.
 */
export function from(lines: string[]): DAGNode {

    const root: DAGNode = {};
    const nodesByName: DAGNode = {}; // Nodes are assumed to have unique names

    /**
     * Find or create a new parent node.
     * Nodes absent from `nodesByName` are treated as root nodes.
     */
    const getParent = (name: string): DAGNode => {
        if (name in nodesByName) {
            return nodesByName[name];
        }

        // Create new root node
        const node = {};
        root[name] = node;
        nodesByName[name] = node;

        return node;
    }

    // Build the DAG
    lines.forEach(line => {
        // A CSV parser is overkill for this data
        const [parentName, childName] = line.split(CSV_SEP);

        // Find/Create the parent
        let parentNode = getParent(parentName);

        // Add the child (if not already present)
        if ((childName in parentNode)) {
            console.error(`Duplicate relation: ${line}`);
            return;
        }

        // Reuse existing nodes
        const childNode = (childName in nodesByName) ? nodesByName[childName] : {};
        nodesByName[childName] = childNode;
        parentNode[childName] = childNode;
    });

    return root;
}

/**
 * Recurse a DAG, build a map of category names to fully qualified category names.
 */
export function calculateCategoryNames(node: DAGNode): Dictionary {
    let result: Dictionary = {};
    const handler: LeafHandler = (nameParts: string[]) => {
        const path = nameParts.join('/');
        const name = nameParts[nameParts.length -1];
        result[name] = path;
    };
    walk(node, handler);
    return result;
}

/**
 * @param true if `obj` is empty
 * Because `{} === {}` is falsey. Sigh.
 */
function isEmpty(obj: Object) {
    return Object.keys(obj).length === 0;
}

/**
 * Recursively descend the DAG, calling `leafHandler` with the path taken to any leaf nodes.
 */
function walk(node: DAGNode, leafHandler: LeafHandler, names: string[] = []) {
    if (isEmpty(node)) {
        leafHandler(names);
        return;
    }

    Object.keys(node).forEach(key => walk(node[key], leafHandler, [...names, key]));
}
