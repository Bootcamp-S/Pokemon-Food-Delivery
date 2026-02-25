const getPokemon = require('./index');

const numTests = 3;
let numPassedTests = 0;
const context1 = { res: null };
const req1 = { query: { name: 'bulbasaur' } };

getPokemon(context1, req1).then(() => {
    console.log('Response:', context1.res);

    const expected = 'Avocado Roll';
    const actual = context1.res?.body?.favoriteFood;
    if (actual !== expected) {
        console.error(`Test failed: expected favoriteFood="${expected}", got "${actual}"`);
        console.error(`${numPassedTests} out of ${numTests} passed.\n`);
        process.exit(1);
    }
    numPassedTests += 1;
    console.log("Test passed.\n");
}).catch(err => {
    console.error('Error:', err);
});

const context2 = { res: null };
const req2 = { query: {} };

getPokemon(context2, req2).then(() => {
    console.log('Response:', context2.res);

    const actual = context2.res?.body?.name;
    const expected = 'pikachu';

    if (actual !== expected) {
        console.error(`Test failed: expected default name="${expected}", got "${actual}"`);
        console.error(`${numPassedTests} out of ${numTests} passed.\n`);
        process.exit(1);
    }
    numPassedTests += 1;
    console.log("Test passed.\n");
}).catch(err => {
    console.error('Error:', err);
});

const context3 = { res: null };
const req3 = { query: { name: 'Marcus' } };

getPokemon(context3, req3).then(() => {
    console.log('Response:', context3.res);

    const expected = 'Coffee';
    const actual = context3.res?.body?.favoriteFood;
    if (actual !== expected) {
        console.error(`Test failed: expected favoriteFood="${expected}", got "${actual}"`);
        console.error(`${numPassedTests} out of ${numTests} passed.\n`);
        process.exit(1);
    }
    numPassedTests += 1;
    console.log("Test passed.\n");
}).catch(err => {
    console.error('Error:', err);
});
