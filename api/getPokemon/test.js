const getPokemon = require('./index');

const context = {
    res: null
};

const req = {
    query: {
        name: 'bulbasaur'
    }
};

getPokemon(context, req).then(() => {
    console.log('Response:', context.res);
    
    const expected = 'Avocado Roll';
    const actual = context.res?.body?.favoriteFood;
    if (actual !== expected) {
        console.error(`Test failed: expected favoriteFood="${expected}", got "${actual}"`);
        process.exit(1);
    }

    console.log("Test passed.");
    
}).catch(err => {
    console.error('Error:', err);
});
