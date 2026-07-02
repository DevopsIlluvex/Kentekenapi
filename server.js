const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

/**
 * 🖼️ IMAGE DATABASE
 */
const carImages = [
    // BMW
    {
        key: "BMW|1 SERIE",
        image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2"
    },
    {
        key: "BMW|2 SERIE",
        image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a"
    },
    {
        key: "BMW|3 SERIE",
        image: "https://res.cloudinary.com/haardsqv/image/upload/f_auto,q_auto/butze-bmw-1254474_patnim"
    },
    {
        key: "BMW|4 SERIE",
        image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738"
    },
    {
        key: "BMW|5 SERIE",
        image: "https://images.unsplash.com/photo-1555215695-3004980ad54e"
    },
    {
        key: "BMW|7 SERIE",
        image: "https://unsplash.com/photos/gray-audi-coupe-on-gray-asphalt-road-during-daytime-Y8-H19uSx-Y"
    },

    // SEAT
    {
    key: "SEAT|LEON",
    image: "https://images.unsplash.com/photo-1659786674426-e663513da556?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
},
{
    key: "SEAT|LEON FR",
    image: "https://images.unsplash.com/photo-1659786674426-e663513da556?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
}
];

/**
 * 🚗 BMW NORMALIZER
 */
function normalizeBMW(model) {
    if (!model) return "UNKNOWN";

    const m = model.toUpperCase();

    if (m.includes("1ER") || m.includes("1 SERIE")) return "1 SERIE";
    if (m.includes("2ER") || m.includes("2 SERIE")) return "2 SERIE";
    if (m.includes("3ER") || m.includes("3 SERIE")) return "3 SERIE";
    if (m.includes("4ER") || m.includes("4 SERIE")) return "4 SERIE";
    if (m.includes("5ER") || m.includes("5 SERIE")) return "5 SERIE";
    if (m.includes("7ER") || m.includes("7 SERIE")) return "7 SERIE";

    return "UNKNOWN";
}

/**
 * 🚗 SEAT NORMALIZER
 */
function normalizeSeat(model) {
    if (!model) return "UNKNOWN";

    const m = model.toUpperCase();

    if (m.includes("LEON FR") || m.includes("FR")) return "LEON FR";
    if (m.includes("LEON")) return "LEON";

    return "UNKNOWN";
}

/**
 * 🧠 MERK ROUTER (BELANGRIJK)
 */
function normalizeModel(merk, model) {
    const m = model || "";

    switch (merk) {
        case "BMW":
            return normalizeBMW(m);

        case "SEAT":
            return normalizeSeat(m);

        default:
            return m.toUpperCase();
    }
}

/**
 * 🖼️ IMAGE MATCHER
 */
function findImage(merk, model) {
    const key = `${merk}|${model}`.toUpperCase();

    return carImages.find(c => c.key === key) || null;
}

/**
 * 🚗 API ENDPOINT
 */
app.get("/api/car", async (req, res) => {
    const kenteken = (req.query.kenteken || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

    try {
        const response = await fetch(
            `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${kenteken}`
        );

        const data = await response.json();

        if (!data.length) {
            return res.status(404).json({ error: "Niet gevonden" });
        }

        const v = data[0];

        const merk = v.merk || "ONBEKEND";

        const model = normalizeModel(merk, v.handelsbenaming);

        const bouwjaar = v.datum_eerste_toelating
            ? v.datum_eerste_toelating.slice(0, 4)
            : null;

        const image = findImage(merk, model);

        res.json({
            kenteken,
            merk,
            model,
            bouwjaar,
            apk: v.vervaldatum_apk || null,
            image: image?.image || null
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * 🚀 START SERVER
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚗 API draait op port", PORT);
});