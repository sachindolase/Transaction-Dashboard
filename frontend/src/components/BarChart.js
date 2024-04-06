import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Chart from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';
import './BarChart.css';

const BarChart = ({ selectedMonth }) => {
    const [barChartData, setBarChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const chartContainerRef = useRef(null);

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
        const fetchBarChartData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`http://localhost:5000/api/bar-chart?month=${selectedMonth}`);
                setBarChartData(response.data.barChartData);
            } catch(error) {
                console.error('Error fetching bar chart data:', error);
                setError('Failed to fetch bar chart data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchBarChartData();
    },[selectedMonth]);

    useEffect(()=> {
        if (chartContainerRef.current) {
            const ctx = chartContainerRef.current.getContext('2d');
            ctx.clearRect(0,0, chartContainerRef.current.width, chartContainerRef.current.height);
        }

        const labels = barChartData.map((item) => {
            const rangeParts = item.range.split('-');
            const min = rangeParts[0];
            const max = rangeParts[1] === 'above' ? 'above' : rangeParts[1];
            return `${min}-${max}`;
        });

        const newChart = new Chart(chartContainerRef.current, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Number of items',
                        data: barChartData.map((item) => item.count),
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        stacked: true,
                    },
                    y: {
                        type: 'linear',
                        stacked: true,
                    },
                },
            },
        });

        return () => {
            if (newChart) {
                newChart.destroy();
            }
        };
    }, [barChartData]);

    return (
        <div className="barGraph">
            <h2>Transactions Bar Chart - {getMonthName(selectedMonth - 1)}</h2>
            <div className="chart" style={{ maxWidth: '850px'}}>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : (
                    <Bar data={{
                        labels: barChartData.map((item) => {
                            const rangeParts = item.range.split('-');
                            const min = rangeParts[0];
                            const max = rangeParts[1] === 'above' ? 'above' : rangeParts[1];
                            return `${min}-${max}`;
                        }),
                        datasets: [
                            {
                                label: 'Number of Items',
                                data: barChartData.map((item) => item.count),
                                backgroundColor: 'blue',
                                borderWidth: 1,
                                barPercentage: 1.2,
                            },
                        ],
                    }}
                    height={400}
                    options={{
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    font: {
                                        weight: 'bold',
                                        size: 15,
                                    },
                                },
                            },
                            x: {
                                ticks: {
                                    font: {
                                        weight: 'bold',
                                        size: 15,
                                    },
                                },
                            },
                        },
                        legend: {
                            labels: {
                                fontSize: 15,
                            },
                        },
                    }}
                    />
                )}
            </div>
        </div>
    );
};

export default BarChart;

