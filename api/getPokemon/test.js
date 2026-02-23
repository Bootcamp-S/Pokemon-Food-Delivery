const getPokemon = require('./index');

// Test 0: M.S. 

// Test 1: Valid Pokémon (bulbasaur)
const context1 = { res: null };
const req1 = { query: { name: 'bulbasaur' } };

getPokemon(context1, req1).then(() => {
    console.log('Response:', context1.res);

    const expected = 'Avocado Roll';
    const actual = context1.res?.body?.favoriteFood;
    if (actual !== expected) {
        console.error(`Test failed: expected favoriteFood="${expected}", got "${actual}"`);
        process.exit(1);
    }

    console.log("Test passed.");
}).catch(err => {
    console.error('Error:', err);
});


//
// Test 2: Pokémon does not exist
//
const context2 = { res: null };
const req2 = { query: { name: 'doesnotexist123' } };

getPokemon(context2, req2).then(() => {
    console.log('Response:', context2.res);

    if (context2.res.status !== 500) {
        console.error(`Test failed: expected status=500, got "${context2.res.status}"`);
        process.exit(1);
    }

    if (!String(context2.res.body).includes('Error')) {
        console.error(`Test failed: expected an error message, got: "${context2.res.body}"`);
        process.exit(1);
    }

    console.log("Test passed.");
}).catch(err => {
    console.error('Error:', err);
});


//
// Test 3: Missing query param → defaults to pikachu
//
const context3 = { res: null };
const req3 = { query: {} };

getPokemon(context3, req3).then(() => {
    console.log('Response:', context3.res);

    const actual = context3.res?.body?.name;
    const expected = 'pikachu';

    if (actual !== expected) {
        console.error(`Test failed: expected default name="${expected}", got "${actual}"`);
        process.exit(1);
    }

    console.log("Test passed.");
}).catch(err => {
    console.error('Error:', err);
});
