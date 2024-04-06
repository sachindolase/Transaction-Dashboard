import React, { useState } from 'react';
import TransactionsTable from './components/TransactionsTable';
import StatisticsBox from './components/StatisticsBox';
import BarChart from './components/BarChart';
import Select from 'react-select';
import './App.css';

const App = () => {
  const [selectedMonth, setSelectedMonth] = useState('03');
  const monthOptions = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const handleMonthChange = (selectedOption) => {
    setSelectedMonth(selectedOption.value);
  };

  return (
    <div>
      <h1 className='dashboard'>Transaction Board</h1>

      <div className='month-select-container'>
        <label>Select Month:</label>
        <Select className='custom-select'
                options={monthOptions}
                value={monthOptions.find((option) => option.value === selectedMonth)}
                onChange={handleMonthChange}
                />
      </div>
            {/* Transactions Table with Pagination */}
      <TransactionsTable selectedMonth={selectedMonth}/>

             {/* Statistics Box */}
      <hr />
      <StatisticsBox selectedMonth={selectedMonth} />

            {/* Bar Chart */}
      <hr />
      <BarChart selectedMonth={selectedMonth} />
    </div>
  );
};

export default App;



