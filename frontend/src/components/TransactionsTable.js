import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TransactionsTable.css';

const TransactionsTable = ({ selectedMonth }) => {
    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(1);
    const [searchText, setSearchText] = useState('');
    const [totalPages, setTotalPages] = useState(1);

    console.log(selectedMonth);

    useEffect(() => {
        console.log('Fetching with params:', selectedMonth, page, searchText);
        const fetchTransactions = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/list-transactions`,{
                
                    params: {
                        month: selectedMonth,
                        page,
                        search: searchText,
                    },
                });
                console.log('API Response:', response.data);
                setTransactions(response.data.transactions);
                setTotalPages(Math.ceil(response.data.totalRecords / 10));
            } catch (error) {
                console.log('Error fetching transactions:', error);
            }
        };

        fetchTransactions();
    }, [selectedMonth, page, searchText]);

    const handleSearch = (event) => {
        setSearchText(event.target.value);
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        // Ensure newPage doesn't go below 1 or exceed totalPage
        if (newPage >=1 && newPage <= totalPages){
            setPage(newPage);
        }
    };

    return (
        <div className="transactions-container">
            <h2>Transaction Table</h2>

            <label className='search'>
                Search:
                <input type='text' value={searchText} onChange={handleSearch} />
            </label>

            <table className='transactions-table'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Sold</th>
                        <th>Image</th>
                        <th>Date of Sale</th>
                        
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                            <td>{transaction.id}</td>
                            <td>{transaction.title}</td>
                            <td>{transaction.description}</td>
                            <td>${transaction.price.toFixed(2)}</td>
                            <td>{transaction.category}</td>
                            <td>{transaction.sold ? 'yes' : 'No'}</td>
                            <td>{transaction.image}</td>
                            <td>{new Date(transaction.dateOfSale).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className='pagination'>
                <button onClick={() => handlePageChange(page -1)} disabled={page === 1}>
                    Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default TransactionsTable;

