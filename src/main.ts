import {calculateCategoryNames, fromFile} from './ClassDB';
import express from 'express';
const PORT_NUMBER = 8080;

/**
 * Martin Cowie - 2021
 */

const args = process.argv.slice(2);
if (args.length < 1) {
    console.error(`wrong # arguments, try <csv-file-name>`);
    process.exit(1);
}

// Build a database
const filename = args[0];
const pathsByName = calculateCategoryNames(fromFile(filename));
console.error(`Loaded ${Object.keys(pathsByName).length} unique categories from ${filename}`);

// Take queries
const app = express();
app.get('/search/data-categories',  (req, res) => {
    const q = req.query.q;

    if (q === undefined) {
        res.status(500).send('absent query parameter: q');
        return;
    }

    // Brute force search - ew
    const reducer = (acc: any, [key, value]:[string, string]) => {
        if (key.startsWith(q.toString())) {
            acc[key] = value;
        }
        return acc;
    };
    const results = Object.entries(pathsByName).reduce(reducer, {});

    res.setHeader('content-type', 'application/json');
    res.send(JSON.stringify({
            'searchTerm': q,
            results
        }));
});

app.listen(PORT_NUMBER);
console.error(`Listening on http://localhost:${PORT_NUMBER}`);