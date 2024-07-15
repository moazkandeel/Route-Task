import { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import {
  CircularProgress, Button,TextField,InputAdornment,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Paper,Backdrop,
} from '@mui/material';
import { Clear } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Link as ScrollLink } from 'react-scroll';
import { FaArrowUp } from 'react-icons/fa';

function App() {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filterByName, setFilterByName] = useState('');
  const [filterByAmount, setFilterByAmount] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [selectedCustomerTransactions, setSelectedCustomerTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const transactionsRef = useRef(null);

  const apiLink = 'https://moazkandeel.github.io/route-api/db.json';

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(apiLink);
      if (data) {
        let fetchedCustomers = data.customers || [];
        let fetchedTransactions = data.transactions || [];

        if (filterByName) {
          fetchedCustomers = fetchedCustomers.filter(cust => cust.name.toLowerCase().includes(filterByName.toLowerCase()));
        }

        if (filterByAmount) {
          const customerAmounts = fetchedTransactions.reduce((acc, transaction) => {
            acc[transaction.customer_id] = (acc[transaction.customer_id] || 0) + transaction.amount;
            return acc;
          }, {});

          fetchedCustomers = fetchedCustomers.filter(cust => customerAmounts[cust.id] === parseFloat(filterByAmount));
        }

        setCustomers(fetchedCustomers);
        setTransactions(fetchedTransactions);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterByName, filterByAmount]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const searchName = (e) => {
    setFilterByName(e.target.value);
    setFilterByAmount('');
  };

  const searchAmount = (e) => {
    setFilterByAmount(e.target.value);
    setFilterByName('');
  };

  const clearFilterByName = () => {
    setFilterByName('');
    fetchData();
  };

  const clearFilterByAmount = () => {
    setFilterByAmount('');
    fetchData();
  };

  const handleCustomerSelection = (customerId) => {
    if (selectedCustomer === customerId) {
      setSelectedCustomer(null);
      setSelectedCustomerTransactions([]);
      setSelectedCustomerName('');
    } else {
      setSelectedCustomer(customerId);
      const customerTransactions = transactions.filter(transaction => transaction.customer_id === customerId);
      setSelectedCustomerTransactions(customerTransactions);
      const selectedCustomerObj = customers.find(cust => cust.id === customerId);
      setSelectedCustomerName(selectedCustomerObj ? selectedCustomerObj.name : '');
      setTimeout(() => {
        if (transactionsRef.current) {
          transactionsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <section className="container mt-5">
      <div id="top"></div> 
      <h1 className='text-center display-3 font-weight-bold text-primary' style={{ fontFamily: 'Playfair Cuba, serif' }}>Route Task</h1>

      <div className='row mt-4'>
        <div className='col-md-6 mb-3'>
          <TextField
            select
            fullWidth
            value={filterByName}
            onChange={searchName}
            variant="outlined"
            label="Select Name"
            InputLabelProps={{ shrink: true }}
            SelectProps={{ native: true }}
          >
            <option value="" disabled></option> {/* هذا هو ال placeholder */}
            {customers.map(cust => (
              <option key={cust.id} value={cust.name}>{cust.name}</option>
            ))}
          </TextField>
          {filterByName && (
            <Button variant="outlined" onClick={clearFilterByName}>Clear</Button>
          )}
        </div>
        <div className='col-md-6 mb-3'>
          <TextField
            fullWidth
            type="number"
            value={filterByAmount}
            onChange={searchAmount}
            variant="outlined"
            label="Filter By Amount"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {filterByAmount && (
                    <Clear style={{ cursor: 'pointer' }} onClick={clearFilterByAmount} />
                  )}
                </InputAdornment>
              )
            }}
            InputLabelProps={{ shrink: true }}
          />
        </div>
      </div>
      <Backdrop open={loading} style={{ zIndex: 1000, color: '#fff' }}>
        <CircularProgress size={80} />
      </Backdrop>
      {!loading && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: '#2196f3', color: '#ffffff' }}>Id</TableCell>
                <TableCell sx={{ backgroundColor: '#2196f3', color: '#ffffff' }}>Name</TableCell>
                <TableCell sx={{ backgroundColor: '#2196f3', color: '#ffffff' }}>Transactions</TableCell>
                <TableCell sx={{ backgroundColor: '#2196f3', color: '#ffffff' }}>Select</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.length > 0 ? customers.map((cust) => {
                const customerTransactions = transactions.filter(transaction => transaction.customer_id === cust.id);
                const totalAmount = customerTransactions.reduce((prev, next) => prev + next.amount, 0);
                return (
                  <TableRow key={cust.id}>
                    <TableCell>{cust.id}</TableCell>
                    <TableCell>{cust.name}</TableCell>
                    <TableCell>
                      {customerTransactions.length > 0 ? (
                        customerTransactions.map((transaction) => (
                          <div key={transaction.id} className='bg-light rounded p-3 my-2'>
                            <ul>
                              <li>date: {transaction.date}</li>
                              <li>amount: {transaction.amount}</li>
                            </ul>
                          </div>
                        ))
                      ) : (
                        <p>No transactions found</p>
                      )}
                      <p className='text-danger font-weight-bold bg-light rounded'>Total amount : {totalAmount}</p>
                    </TableCell>
                    <TableCell>
                      <i
                        className={`fas fa-check-circle ${selectedCustomer === cust.id ? 'text-success' : 'text-secondary'}`}
                        onClick={() => handleCustomerSelection(cust.id)}
                        style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                      ></i>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={4}>
                    <p className='text-danger font-weight-bold text-center'>Sorry!!!!! No Data Matches Your Write</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <div className='p-5 bg-light border rounded' ref={transactionsRef}>
        {selectedCustomerName && <h3 className='text-center mb-4'>Selected Customer: {selectedCustomerName}</h3>}
        {selectedCustomerTransactions.length > 0 ?
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={selectedCustomerTransactions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        :
          <p className='text-danger font-weight-bold text-center'>You Should Select a customer to show his chart</p>
        }
      </div>
      {showScroll && (
        <ScrollLink to="top" smooth={true} duration={500} className='position-fixed bottom-0 end-0 m-3'>
          <FaArrowUp size={40} className='text-primary' style={{ cursor: 'pointer', borderRadius: '50%', backgroundColor: '#fff', padding: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.2)' }} />
        </ScrollLink>
      )}
    </section>
  );
}

export default App;
