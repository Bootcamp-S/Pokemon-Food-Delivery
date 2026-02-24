const request = require("supertest");
const createServer = require("./test-server");

const app = createServer();

describe("GET /api/pokemon", () => {

    test("Valid Pokémon: bulbasaur → Avocado Roll", async () => {
        const res = await request(app).get("/api/pokemon?name=bulbasaur");

        expect(res.statusCode).toBe(200);
        expect(res.body.favoriteFood).toBe("Avocado Roll");
    });

    test("Unknown Pokémon returns 500", async () => {
        const res = await request(app).get("/api/pokemon?name=doesnotexist123");

        expect(res.statusCode).toBe(500);
        expect(String(res.text)).toContain("Error");
    });

    test("Missing name defaults to pikachu", async () => {
        const res = await request(app).get("/api/pokemon");

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe("pikachu");
    });

});
