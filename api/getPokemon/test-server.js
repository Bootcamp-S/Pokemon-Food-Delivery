const express = require('express');
const getPokemon = require('./index');

function createTestServer() {
    const app = express();

    app.get('/api/pokemon', async (req, res) => {
        const context = { res: {} };
        await getPokemon(context, { query: req.query });

        res.status(context.res.status || 200).send(context.res.body);
    });

    return app;
}

module.exports = createTestServer;
