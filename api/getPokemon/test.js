const getPokemon = require('./index');

const numTests = 3;
let numPassedTests = 0;

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message} expected="${expected}", got="${actual}"`);
  }
}

async function test1() {
  const context = { res: null };
  const req = { query: { name: 'bulbasaur' } };
  await getPokemon(context, req);

  const expected = 'Avocado Roll';
  const actual = context.res?.body?.favoriteFood;
  assertEqual(actual, expected, 'Test1 failed: favoriteFood mismatch');
  console.log('Test1 passed.\n');
  numPassedTests += 1;
}

async function test2() {
  const context = { res: null };
  const req = { query: {} };
  await getPokemon(context, req);

  const expected = 'pikachu';
  const actual = context.res?.body?.name;
  assertEqual(actual, expected, 'Test2 failed: default name mismatch');
  console.log('Test2 passed.\n');
  numPassedTests += 1;
}

async function test3() {
  const context = { res: null };
  const req = { query: { name: 'Marcus' } };
  await getPokemon(context, req);

  const expected = 'Coffee';
  const actual = context.res?.body?.favoriteFood;
  assertEqual(actual, expected, 'Test3 failed: favoriteFood mismatch');
  console.log('Test3 passed.\n');
  numPassedTests += 1;
}

(async () => {
  try {
    await test1();
    await test2();
    await test3();
    console.log(`${numPassedTests} out of ${numTests} passed.\n`);
    process.exit(0);
  } catch (err) {
    console.error(err.message || err);
    console.error(`${numPassedTests} out of ${numTests} passed.\n`);
    process.exit(1);
  }
})();