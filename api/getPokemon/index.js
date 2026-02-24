const axios = require('axios');

module.exports = async function (context, req) {
    const nameRaw = req.query.name || 'pikachu';
    const name = String(nameRaw).toLowerCase();

    // Mapping of Pokémon types to their favorite sushi
    const sushiPreferences = {
        electric: 'Salmon',
        fire: 'Tuna',
        water: 'Mackerel',
        grass: 'Avocado Roll',
        psychic: 'Tamago',
        rock: 'Cucumber',
        ground: 'Daikon',
        ice: 'Surimi',
        dragon: 'Unagi',
        dark: 'Squid',
        fairy: 'Strawberry Mochi',
        bug: 'Edamame',
        poison: 'Wasabi',
        ghost: 'Ghost Algae',
        steel: 'Sesame Roll',
        fighting: 'Protein Roll',
        flying: 'Airy Rice Ball',
        normal: 'Classic Nigiri'
    };

    // ✅ Custom short-circuit for "seyfert"
    if (name === 'seyfert') {
        const customPokemon = {
            name: 'Marcus',
            id: 42,                 
            height: 17,    
            weight: 888,
            base_experience: 300,
            type: 'seyfert',
            favorite_drink: 'Coffee',
            abilities: ['coffee_blast', 'coffee_bomb'],
        };

        context.res = {
            status: 200,
            body: customPokemon
        };
        return;
    }

    try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const data = response.data;

        const types = data.types.map(t => t.type.name);
        const favoriteFood = sushiPreferences[types[0]] || 'Maki Roll';

        const result = {
            name: data.name,
            id: data.id,
            height: data.height,
            weight: data.weight,
            base_experience: data.base_experience,
            types: types,
            favoriteFood: favoriteFood
        };

        context.res = {
            status: 200,
            body: result
        };
    } catch (err) {
        context.res = {
            status: (err.response && err.response.status) || 500,
            body: `Error: ${err.message}`
        };
    }
};
