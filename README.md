# README.md


## Installation

`npm install `

## Execution

`npm run` and then in a separate shell `curl http://localhost:8080/search/data-categories?q=P`

Add clarity and pipe output through `jq`, e.g.
```
curl http://localhost:8080/search/data-categories?q=A | jq .
```

## Assumptions

* Node/category names in the CSV input data are unique.

* Excepting root nodes, nodes are always introduced as children before use as a parent node.  This makes the DAG building a one-pass activity, with no re-parenting of nodes required.

## Observations

* There is some duplication in the input data. This is logged.

* The input data describes a DAG rather than a strict tree, as branches unify and a node can have many parent nodes.

## Wish List

* Unit tests for `ClassDB.ts`. Integration tests for `main.ts`

* Replace the brute force string search in `main.ts`, use an n-ary tree index for search-terms (and perhaps npm has something to fill this gap).

* Though the two stages here (CSV -> DAG -> Table) works, I would like to investigate simplification of the algorithm to build the table of (category-name -> fully qualified category-name)

* Serialising the path to a category by joining with `/` characters is arbitrary, and could more usefully be an array of string.

* function `walk` and type `LeafHandler` in `ClassDB.ts` would have been nicer as an iterator/generator to iterate over the DAG leaves.
