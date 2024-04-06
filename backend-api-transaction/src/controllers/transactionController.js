const axios = require('axios');
const { MongoClient } = require('mongodb');

const mongoUrl = 'mongodb+srv://sachindolase09:Sa1ni%30ya@cluster0.qeunnhc.mongodb.net/?retryWrites=true';
const dbName = 'MERN-TRANSACTION-TABLE';

let productTransactionsCollection;

// All API to initialize the database
async function initializeDatabase(req, res) {
    try {
        // Fetch the data from an api
        const response = await axios.getAdapter(`https://s3.amazonaws.com/roxiler.com/product_transaction.json`);

        // transform the data to your desired structure

        const transactions = response.data.map((transaction, index) => ({
            id: index + 1,
            title: transaction.title,
            price: transaction.price,
            description: transaction.description,
            category: transaction.category,
            image: transaction.image,
            sold: transaction.sold,
            dateOfSale: transaction.dateOfSale,
        }));

        const client = new MongoClient(mongoUrl, {
            useNewUrlParser: true,
            useunifiedTopology: true
        });
        await client.connect();

        // Use the 'transactions' collection
        const db = client.db(dbName);
        const productTransactionsCollection = db.collection('transactions');

        // Insert data into MongoDB
        await productTransactionsCollection.insertMany(transactions);

        console.log('Data inserted successfully into MongoDB');
        // close the MongoDB connection
        await client.close();

        res.json({ message: 'Database initialized successfully' });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// API to list all transactions with search and pagination

async function listTransactions(req, res) {
    const { month } = req.query;
    const { page = 1, perPage = 10, search = ''} = req.query;

    const client = new MongoClient(mongoUrl, {
        useNewUrlParser: true,
        useunifiedTopology: true
    });
    await client.connect();

    try {
        // use the 'transactions' collection
        const db = client.db(dbName);
        const productTransactionsCollection = db.collection('transactions');

        // Construct the query for matching month and search paramenters

        const query = {
            dateOfSale: {
                $regex: `-${month}-`,
            },
        };

        if (search){
            query.$or = [
                { title: { $regex: new RegExp(search, 'i') } },
                { description: { $regex: new RegExp(search, 'i') } },
                { price: { $regex: new RegExp(search, 'i') } },
            ];
        }

        // count the total records for pagination
        const totalRecords = await productTransactionsCollection.countDocuments(query);

        // Implement pagination logic
        const skip = (page - 1) * perPage;
        const limit = perPage;

        const transactions = await productTransactionsCollection.find(query).skip(skip).limit(limit).toArray();

        const formattedTransactions = transactions.map((transaction, index) => ({
            id: index + 1,
            title: transaction.title,
            price: transaction.price,
            description: transaction.description,
            category: transaction.category,
            image: transaction.image,
            sold: transaction.sold,
            dateOfSale: transaction.dateOfSale,
        }));

        res.json({ transactions: formattedTransactions, totalRecords });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {

        await client.close();
    }
}

// API for statistics 
async function statistics(req, res) {
    const { month } = req.query;

    // connect to MongoDB
    const client = new MongoClient(mongoUrl, {
        useNewUrlParser: true,
        useunifiedTopology: true,
    });
    await client.connect();

    const db = client.db(dbName);
    const productTransactionsCollection = db.collection('transactions');

    try {
        // Construct the query fro matching month
        const query = {
            dateOfSale: {
                $regex: `-${month}-`,
            },
        };


        // case-insensitive regex match for the month
        // calculate total sale amount, sold items, and not sold items
        // console.log('Query:', query);

        const totalSaleAmount = await productTransactionsCollection
        .aggregate([
            { $match: query },
            { $group: { _id: null, total: { $sum: '$price' } } },
        ])
        .toArray();

        // console.log('Aggregation Result:', totalSaleamount);

        const totalSoldItems = await productTransactionsCollection.countDocuments(query);
        const totalNotSoldItems = await productTransactionsCollection.countDocuments({
            ...query,
            sold: false,
        });

        //console.log('Total Sold Items:', totalSoldItems);
        //console.log('Total Not Sold Items:', totalNotSoldItems);
        
        res.json({
            totalSaleAmount: totalSaleAmount.length > 0 ? totalSaleAmount[0].total : 0,
            totalSoldItems,
            totalNotSoldItems,
        });

        console.log('Response: ', {
            totalSaleAmount: totalSaleAmount.length > 0 ? totalSaleAmount[0].total : 0,
            totalSoldItems,
            totalNotSoldItems,
        });
    
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await client.close();
    }
}

// api for the barchart
async function barchart(req, res) {
    const { month } = req.query;

    const client = new MongoClient(mongoUrl, {
        useNewUrlParser: true,
        useunifiedTopology: true,
    });
    await client.connect();

    // use the 'transactions' connection
    const db = client.db(dbName);
    productTransactionsCollection = db.collection('transactions');

    try {
        const query = {
            dateOfSale: {
                $regex: `-${month}-`,
            },
        };

        console.log('Bar chart month', month);
        // define the price ranges
        const priceRanges = [
            { min: 0, max: 100 },
            { min: 101, max: 200 },
            { min: 201, max: 300 },
            { min: 301, max: 400 },
            { min: 401, max: 500 },
            { min: 501, max: 600 },
            { min: 601, max: 700 },
            { min: 701, max: 800 },
            { min: 801, max: 900 },
            { min: 901, max: Infinity },
        ];

        // initialize the counts of for each range
        const counts = Array(priceRanges.length).fill(0);

        // retrive transactions based on the constructed query
        const transactions = await productTransactionsCollection.find(query).toArray();

        // count items in each price range
        transactions.forEach((transaction) => {
            const { price } = transaction;
            const rangeIndex = priceRanges.findIndex((range) => price >= range.min && price <= range.max);
            if (rangeIndex !== -1) {
                counts[rangeIndex]++;
            }
        });

        const responseData = priceRanges.map((range, index) => ({
            range: `${range.min}-${range.max === Infinity ? 'above' : range.max}`,
            count: counts[index],
        }));

        res.json({ barchartData: responseData });
    } catch(error) {
        console.error(error.message);
        console.error(error.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {

        await client.close();
    }
}

// api for the piechart 
async function piechart(req, res) {
    const { month } = req.query;

    const client = new MongoClient(mongoUrl, { 
        useNewUrlParser:true,
        useunifiedTopology: true,
    });
    await client.connect();

    const db = client.db(dbName);
    productTransactionsCollection = db.collection('transactions');

    try {
        const query = {
            dateOfSale: {
                $regex: `-${month}-`,
            },
        };

        // retrive unique categories and count the number of items in each category
        const categoryVounts = await productTransactionsCollection
        .aggregate([
            { $match: query },
            { $group: { _id: '$category', count: { $sum: 1 } } },
        ])
        .toArray();

        // Format the result for the pie chart
        const piechartData = categoryCounts.map(({ _id, count }) => ({ category: _id, count }));

        res.json({ piechartData });
    } catch(error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {

        await client.close();
    }
}


async function combinedResponse(req, res) {
    const { month } = req.query;

    const client = new MongoClient(mongoUrl, {
        useNewUrlParser: true,
        useunifiedTopology: true,
    });

    const db = client.db(dbName);
    productTransactionsCollection = db.collection('transactions');

    const query = {
        dateOfSale: {
            $regex: `-${month}-`,
        },
    };

    try {
        // fetch the data for the all apis
        const initializeResponse = await axios.get('http://localhost:5000/api/initialize-database');
        const listTransactionsResponse = await axios.get(`http://localhost:5000/api/list-transactions?month=${month}`);
        const statisticsResponse = await axios.get(`http://localhost:5000/api/statistics?month=${month}`);
        const barChartResponse = await axios.get(`http://localhost:5000/api/bar-chart?month=${month}`);
        const pieChartResponse = await axios.get(`http://localhost:5000/api/pie-chart?month=${month}`);
        
        const combinedResponse = {
            initialize: initializeResponse.data,
            listTransactions: listTransactionsResponse.data,
            statistics: statisticsResponse.data,
            barchart: barChartResponse.data,
            piechart: pieChartResponse.data,
        };
        res.json(combinedResponse);
    } catch (error) {
        console.error('Error in combinedResponse:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await client.close();
    }
}

module.exports = {
    initializeDatabase,
    listTransactions,
    statistics,
    barchart,
    piechart,
    combinedResponse,
};


