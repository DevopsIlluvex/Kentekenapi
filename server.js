const express = require("express");
const cors = require("cors");

const bmwGenerations = [
    { name: "E36", from: 1990, to: 1999 },
    { name: "E46", from: 1998, to: 2006 },
    { name: "E90", from: 2005, to: 2013 },
    { name: "F30", from: 2011, to: 2019 },
    { name: "G20", from: 2018, to: 9999 }
];

const app = express();
app.use(cors());


const carImages = [
    {
        key: "BMW|3 SERIE|E46",
        image: "https://res.cloudinary.com/haardsqv/image/upload/f_auto,q_auto/butze-bmw-1254474_patnim"
    },
    {
        key: "BMW|3 SERIE|",
        image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7"
    }
];

function normalizeModel(merk, model) {
    model = model.toUpperCase();

    if (merk === "BMW" && model.includes("3ER")) return "3 SERIE";
    if (merk === "BMW" && model.includes("5ER")) return "5 SERIE";
    if (merk === "BMW" && model.includes("1ER")) return "1 SERIE";

    return model;
}


function getBMWGeneration(year) {
    const y = parseInt(year);

    const gen = bmwGenerations.find(g => y >= g.from && y <= g.to);

    return gen ? gen.name : null;
}

function extractTrim(model) {
    const m = model.toUpperCase();

    const match = m.match(/\b(316I|318I|320I|325I|330I|316D|318D|320D|330D)\b/);

    return match ? match[0] : "";
}

function cleanModel(model) {
    return model.replace(/\d{3}[A-Z]?/gi, "").trim();
}

/**
 * 🚗 API ENDPOINT
 */
app.get("/api/car", async (req, res) => {
    const kenteken = (req.query.kenteken || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

    const response = await fetch(
        `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${kenteken}`
    );

    const data = await response.json();

    if (!data.length) {
        return res.status(404).json({ error: "Niet gevonden" });
    }

    const v = data[0];

    const merk = v.merk;
    const model = normalizeModel(merk, v.handelsbenaming);

    const year = v.datum_eerste_toelating?.slice(0, 4);
    const uitvoering = extractTrim(v.handelsbenaming);
    const generatie = merk === "BMW" ? getBMWGeneration(year) : null;

    const image = findImage(merk, model, generatie);

    res.json({
    kenteken,
    merk,
    model,
    generatie,
    uitvoering,
    bouwjaar: year,
    apk: v.vervaldatum_apk,
    image: image?.image || null,
    image_key: `${merk}|${model}|${generatie}|${uitvoering}`
});

function findImage(merk, model, generatie) {
    const full = `${merk}|${model}|${generatie}`.toUpperCase();
    const fallback = `${merk}|${model}|`.toUpperCase();

    return (
        carImages.find(c => c.key === full) ||
        carImages.find(c => c.key === fallback) ||
        null
    );
}


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚗 API draait op port", PORT);
});