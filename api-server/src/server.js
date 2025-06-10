// Load environment variables from config file
require('dotenv').config({ path: './config/config.env' });
const express = require('express');

const PORT = 5001;

const app = express();

const router = express.Router();
router.get("/", (req, res) => {
    res.send("<h1>Test</h1>");
})
app.use(router);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
