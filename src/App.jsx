import React, { useEffect } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { auth } from './supabase'
import { useAmazonStore } from './store'
import Header from './components/Header'
import Home from './pages/Home'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Orders from './pages/Orders'
import Payment from './pages/Payment'
import ErrorBoundary from './components/ErrorBoundary'

// Stripe公钥
const stripePromise = loadStripe('pk_test_51S8ZOBGyrVlk5VQvz8Aj10dSBHJOMrCc4J12vda8Y8i014051jIfpFm68Je8ifLX2McRzGqFC24o7qffFUazV4Zn003nHZjp5f');

function App() {
  const setUser = useAmazonStore((state) => state.setUser);

  useEffect(() => {
    // Listen for authentication state changes with Supabase
    const { data: { subscription } } = auth.onAuthStateChanged((authUser) => {
      console.log('THE USER IS >>> ', authUser);
      
      if (authUser) {
        // User is signed in
        setUser(authUser);
      } else {
        // User is signed out
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => subscription?.unsubscribe();
  }, [setUser]);

  return (
    <Router>
      <div className='app'>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <>
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/payment" element={
                  <ErrorBoundary>
                    <Elements stripe={stripePromise}>
                      <Payment />
                    </Elements>
                  </ErrorBoundary>
                } />
              </Routes>
            </>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
