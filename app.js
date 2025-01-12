const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());
app.use(express.static('public'));

// Load or initialize user data
let users = {};
const usersFilePath = path.join(__dirname, 'users.json');
if (fs.existsSync(usersFilePath)) {
  users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
}

// Save user data to file
function saveUsers() {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
}

// Route to submit a name
app.post('/submit', (req, res) => {
  const { name } = req.body;
  const ip = req.ip;
  const userAgent = req.headers['user-agent'];

  // Check if the IP or device already exists
  const existingUser = Object.values(users).find(
    user => user.ip === ip || user.userAgent === userAgent
  );

  if (existingUser) {
    return res.status(400).json({ error: 'Only one name per IP and device allowed.' });
  }

  // Save the new user
  users[name] = { ip, userAgent };
  saveUsers();
  res.status(200).json({ success: true });
});

// Route to get all names
app.get('/names', (req, res) => {
  res.json(Object.keys(users));
});

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
