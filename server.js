const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();

/* ================================
   Middleware
================================ */

// Enable CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* ================================
   Firebase Admin Initialization
================================ */

// Uses VM service account automatically (no key file needed)
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();
db.settings({ databaseId: "skill" });

/* ================================
   Routes
================================ */

// Health check (VERY IMPORTANT for Load Balancer)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Root route (optional but useful)
app.get("/", (req, res) => {
  res.json({ message: "Skill Palaver Backend Running 🚀" });
});

// Save score
app.post("/save-score", async (req, res) => {
  try {
    const { score } = req.body;

    if (typeof score !== "number") {
      return res.status(400).json({ error: "Score must be a number" });
    }

    await db.collection("scores").add({
      score: score,
      createdAt: new Date()
    });

    res.json({ message: "Score saved successfully!" });

  } catch (error) {
    console.error("Save score error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get top scores
app.get("/scores", async (req, res) => {
  try {
    const snapshot = await db
      .collection("scores")
      .orderBy("score", "desc")
      .limit(10)
      .get();

    const scores = snapshot.docs.map(doc => doc.data());
    res.json(scores);

  } catch (error) {
    console.error("Fetch scores error:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ================================
   Server Start
================================ */

// IMPORTANT: Dynamic port for cloud
const PORT = process.env.PORT || 80;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
