const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/api/car", async (req, res) => {
    const kenteken = (req.query.kenteken || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

    if (!kenteken) {
        return res.status(400).json({
            error: "Geen kenteken opgegeven"
        });
    }

    try {
        const response = await fetch(
            `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${kenteken}`
        );

        const data = await response.json();

        if (!data.length) {
            return res.status(404).json({
                error: "Voertuig niet gevonden"
            });
        }

        const auto = data[0];

        res.json({
            kenteken,
            merk: auto.merk,
            model: auto.handelsbenaming,
            bouwjaar: auto.datum_eerste_toelating?.slice(0, 4),
            kleur: auto.eerste_kleur,
            apk: auto.vervaldatum_apk
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "RDW niet bereikbaar"
        });
    }
});

app.listen(3000, () => {
    console.log("🚗 API draait op http://localhost:3000");
});