const express = require('express');
const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({status: 'ok'}));

// Placeholder endpoints
app.get('/parts', (req, res) => res.json({data: []}));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on ${port}`));
