import React, { useEffect, useState } from "react";
import axios from "axios";
import './StatisticsBox.css';

const StatisticsBox = ({ selectedMonth }) => {
    const [statistics, setStatistics] = useState({
        totalSaleAmount: 0,
        totalSoldItems: 0,
        totalNotSoldItems: 0,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const getMonthName = (monthIndex) => {
        return monthNames[monthIndex];
    };

    useEffect(() => {
        const fetchStatistics = async () => {
            setLoading(true);
            setError(null);

            try {
                // eslint-disable-next-line no-template-curly-in-string
                const response = await axios.get(`http://localhost:5000/api/statistics?month=${selectedMonth}`);
                console.log('API Response:', response.data);
                if(response.data && response.data.hasOwnProperty('totalSaleAmount') && response.data.hasOwnProperty('totalSoldItems') && response.data.hasOwnProperty('totalNotSoldItems')) {

                    setStatistics(response.data);
                } else {
                    setError('Invalid response format from the server.');
                }
            } catch(error) {
                console.error('Error fetching statistics data:', error);
                setError('Failed to fetch statistics data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, [selectedMonth]);


    return (
        <div className='bkgrnd'>
            <h2>Transaction statistics - {getMonthName(selectedMonth - 1)}</h2>

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <div className="statistics">
                    <p>Total Sale Amount: ${statistics.totalSaleAmount}</p>
                    <p>Total Sold Items: {statistics.totalSoldItems}</p>
                    <p>Total NOt Sold Items: {statistics.totalNotSoldItems}</p>
                    </div>
            )}
        </div>
    );
    
};

export default StatisticsBox;


