const express = require('express');
const bodyParser = require('body-parser');
const transactionController = require('./controllers/transactionController');
const cors = require('cors');



const app = express();
const port = 5000;

app.use(cors());
app.use(json());

// find the api routes
app.get('/api/initialize-database', initializeDatabase);
app.get('/api/list-transactions', listTransactions);
app.get('/api/statistics', statistics);
app.get('/api/bar-chart', barChart);
app.get('/api/pie-chart', pieChart);
app.get('/api/combined-response', combinedResponse); 

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


