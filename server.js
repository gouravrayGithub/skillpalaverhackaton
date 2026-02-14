const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();

// ✅ Proper CORS configuration
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// ✅ Initialize Firebase Admin using VM credentials
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

// ✅ Connect to specific Firestore database
const db = admin.firestore();
db.settings({ databaseId: "skill" });

// 🔹 Health check endpoint (important for future auto-healing)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// 🔹 Save score
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

    res.json({ message: "Score saved!" });
  } catch (error) {
    console.error("Save score error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Get top scores
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

// ✅ VERY IMPORTANT: Listen on 0.0.0.0 for external access
app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
