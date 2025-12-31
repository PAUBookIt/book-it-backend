// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5001;
const SECRET_KEY = process.env.JWT_SECRET || "dev_secret_key";

// --- 1. TRAFFIC CAM (MOVED TO THE VERY TOP) ---
// This ensures we see EVERY request, even failed ones or CORS pre-flights
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- 2. CORS CONFIGURATION (STRICT) ---
app.use(
  cors({
    origin: true, // Allow any origin (for local testing)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --- 3. OPTIONS HANDLING ---
// Explicitly handle pre-flight requests to ensure browser is happy
app.options(/(.*)/, cors());

app.use(express.json());

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

// --- ROUTES ---

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Online" });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.json({
      access_token: token,
      user: { ...user, isDevMode: false },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email.endsWith("@pau.edu.ng"))
    return res.status(400).json({ error: "Must use PAU email" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "student",
      },
    });
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
      expiresIn: "24h",
    });
    res.json({ access_token: token, user });
  } catch (error) {
    res.status(400).json({ error: "Email already exists" });
  }
});

app.get("/api/classrooms", async (req, res) => {
  try {
    const classrooms = await prisma.classroom.findMany({
      include: { notes: true },
    });
    res.json({
      SST: classrooms.filter((c) => c.location === "SST"),
      TYD: classrooms.filter((c) => c.location === "TYD"),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch classrooms" });
  }
});

app.put("/api/classrooms/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status, utilities, note } = req.body;
  if (req.user.role !== "facility" && req.user.role !== "admin")
    return res.status(403).json({ error: "Unauthorized" });

  try {
    if (note)
      await prisma.note.create({
        data: { text: note, classroomId: parseInt(id) },
      });
    const updated = await prisma.classroom.update({
      where: { id: parseInt(id) },
      data: { status, utilities },
      include: { notes: true },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update classroom" });
  }
});

app.get("/api/reservations", async (req, res) => {
  const bookings = await prisma.booking.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      classroom: { select: { name: true } },
    },
  });
  res.json({
    pending: bookings.filter((b) => b.status === "PENDING"),
    approved: bookings.filter((b) => b.status === "APPROVED"),
    denied: bookings.filter((b) => b.status === "DENIED"),
    lastUpdate: Date.now(),
  });
});

// --- POST RESERVATION (With Debugging) ---
app.post("/api/reservations", authenticateToken, async (req, res) => {
  console.log("---- INCOMING RESERVATION ----");
  console.log("Body:", req.body);

  const { classroomId, startTime, endTime, purpose } = req.body;

  try {
    if (!classroomId || !startTime || !endTime) {
      console.log("ERROR: Missing fields");
      return res.status(400).json({ error: "Missing fields" });
    }

    const newBooking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        classroomId: parseInt(classroomId),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        purpose: purpose || "Class Session",
        status: "PENDING",
      },
    });
    console.log("SUCCESS: Booking Created", newBooking);
    res.json(newBooking);
  } catch (error) {
    console.error("ERROR: Booking Failed", error);
    res.status(500).json({ error: "Booking failed", details: error.message });
  }
});

// REPLACE the existing PUT route with this DEBUG version:

app.put("/api/reservations/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log(`---- UPDATING RESERVATION ${id} ----`);
  console.log(`New Status: ${status}`);

  // Only Admin can approve/deny
  if (req.user.role !== "admin") {
    console.log("ERROR: Unauthorized user tried to update");
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const updated = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status }, // If status is "APPROVED", this should now work
    });
    console.log("SUCCESS: Updated record:", updated);
    res.json(updated);
  } catch (error) {
    console.error("UPDATE ERROR:", error); // <--- THIS WILL SHOW THE REAL REASON
    res.status(500).json({ error: "Update failed", details: error.message });
  }
});

// --- SEED ROUTE (Keep your previous seed route here) ---
// (I omitted the long list to save space, but DO NOT DELETE IT from your file)
// REPLACE the placeholder /api/seed route with this:

app.post("/api/seed", async (req, res) => {
  try {
    // 1. Create Users
    const password = await bcrypt.hash("Admin123", 10);
    const studentPassword = await bcrypt.hash("Student123", 10);

    // Admin
    await prisma.user.upsert({
      where: { email: "admin@pau.edu.ng" },
      update: {},
      create: {
        email: "admin@pau.edu.ng",
        password,
        firstName: "Admin",
        lastName: "User",
        role: "admin",
      },
    });

    // Facility
    await prisma.user.upsert({
      where: { email: "facility@pau.edu.ng" },
      update: {},
      create: {
        email: "facility@pau.edu.ng",
        password,
        firstName: "Facility",
        lastName: "Staff",
        role: "facility",
      },
    });

    // Student
    await prisma.user.upsert({
      where: { email: "student@pau.edu.ng" },
      update: {},
      create: {
        email: "student@pau.edu.ng",
        password: studentPassword,
        firstName: "John",
        lastName: "Student",
        role: "student",
      },
    });

    // 2. Create Classrooms
    const rooms = [
      { name: "Engineering Drawing Studio", capacity: 80, location: "SST" },
      {
        name: "Electronics, Control and Telecomms Lab",
        capacity: 50,
        location: "SST",
      },
      {
        name: "Electrical Power and Machines Lab",
        capacity: 50,
        location: "SST",
      },
      { name: "Computer lab 01", capacity: 50, location: "SST" },
      { name: "Thermofluid lab", capacity: 50, location: "SST" },
      { name: "Mechanics of Machines", capacity: 20, location: "SST" },
      { name: "Classroom 1", capacity: 50, location: "SST" },
      { name: "Classroom 2", capacity: 50, location: "SST" },
      { name: "Computer Lab 02", capacity: 50, location: "SST" },
      { name: "Chemistry lab", capacity: 50, location: "SST" },
      {
        name: "Physics and Applied Electricity lab",
        capacity: 50,
        location: "SST",
      },
      { name: "Classroom 3", capacity: 50, location: "SST" },
      { name: "Classroom 4", capacity: 50, location: "SST" },
      { name: "Classroom 5", capacity: 50, location: "SST" },
      { name: "Strength of Materials", capacity: 15, location: "SST" },
      { name: "SST New Classroom (Year 4)", capacity: 25, location: "SST" },
      { name: "Syndicate Room 1", capacity: 10, location: "SST" },
      { name: "Syndicate Room 2", capacity: 10, location: "SST" },
      // TYD
      { name: "Maiduguri", capacity: 50, location: "TYD" },
      { name: "Ado-Ekiti", capacity: 50, location: "TYD" },
      { name: "Jalingo", capacity: 80, location: "TYD" },
      { name: "Zaria", capacity: 80, location: "TYD" },
      { name: "Jos", capacity: 50, location: "TYD" },
      { name: "Enugu", capacity: 50, location: "TYD" },
      { name: "Uyo", capacity: 30, location: "TYD" },
      { name: "Lokoja", capacity: 30, location: "TYD" },
      { name: "Bauchi", capacity: 80, location: "TYD" },
      { name: "Oshogbo", capacity: 30, location: "TYD" },
      { name: "Umuahia", capacity: 30, location: "TYD" },
      { name: "Art and Graphics Studio", capacity: 65, location: "TYD" },
      { name: "Newsroom", capacity: 30, location: "TYD" },
      { name: "Port-Harcourt", capacity: 80, location: "TYD" },
      { name: "Computer Lab 2", capacity: 60, location: "TYD" },
      { name: "Computer Lab 1", capacity: 60, location: "TYD" },
      { name: "Abeokuta", capacity: 30, location: "TYD" },
      { name: "Abakaliki", capacity: 80, location: "TYD" },
      { name: "Ibadan", capacity: 65, location: "TYD" },
      { name: "Asaba", capacity: 65, location: "TYD" },
      { name: "TYD New classroom", capacity: 80, location: "TYD" },
    ];

    for (const room of rooms) {
      await prisma.classroom.upsert({
        where: { name: room.name },
        update: {},
        create: {
          name: room.name,
          capacity: room.capacity,
          location: room.location,
          status: "AVAILABLE",
          utilities: { projector: "WORKING", ac: "WORKING", power: "WORKING" },
        },
      });
    }

    res.json({
      message: "Database successfully seeded with Users and Classrooms!",
    });
  } catch (error) {
    console.error("Seed Error:", error);
    res.status(500).json({ error: "Seeding failed", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
