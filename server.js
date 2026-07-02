const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/api/car", async (req, res) => {
    const kenteken = (req.query.kenteken || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

    if (!kenteken) {
        return res.status(400).json({ error: "Geen kenteken" });
    }

    try {
        const response = await fetch(
            `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${kenteken}`
        );

        const data = await response.json();

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Niet gevonden" });
        }

        const v = data[0];

        res.json({
            kenteken,
            merk: v.merk,
            model: v.handelsbenaming,
            bouwjaar: v.datum_eerste_toelating?.slice(0, 4),
            apk: v.vervaldatum_apk
        });

    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("API draait op port", PORT);
});