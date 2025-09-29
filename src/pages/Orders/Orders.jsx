import React, { useState, useEffect } from 'react';
import './Orders.css';
import { db } from '../../supabase';
import { useAmazonStore } from '../../store';
import Order from '../../components/Order';

function Orders() {
  const user = useAmazonStore((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscription = null;

    if (user) {
      const fetchOrders = async () => {
        try {
          let ordersData = [];
          
          // 首先尝试从Supabase获取
          try {
            ordersData = await db.getUserOrders(user.id);
            console.log('Orders loaded from Supabase:', ordersData);
          } catch (dbError) {
            console.log('Supabase not available, loading from localStorage:', dbError.message);
            
            // 如果Supabase失败，从localStorage获取
            const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            ordersData = localOrders.filter(order => order.user_id === user.id);
            console.log('Orders loaded from localStorage:', ordersData);
          }
          
          // 转换数据格式以匹配原有结构
          const formattedOrders = ordersData.map(order => ({
            id: order.payment_intent_id || order.id,
            data: {
              basket: order.basket,
              amount: order.amount,
              created: new Date(order.created_at).getTime() / 1000 // 转换为Unix时间戳
            }
          }));
          
          setOrders(formattedOrders);
          setLoading(false);
          setError(null);
        } catch (error) {
          console.error('Error fetching orders:', error);
          setError('Failed to load orders. Please try again.');
          setLoading(false);
        }
      };

      fetchOrders();

      // 设置实时监听（可选）
      try {
        subscription = db.subscribeToOrders(user.id, () => {
          fetchOrders(); // 有变化时重新获取数据
        });
      } catch (error) {
        console.log('Real-time subscription not available:', error);
      }
    } else {
      // 用户未登录，清空订单
      setOrders([]);
      setLoading(false);
      setError(null);
    }

    // 清理函数
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user]);

  if (!user) {
    return (
      <div className='orders'>
        <div className='orders__notLoggedIn'>
          <h1>Please sign in to view your orders</h1>
          <p>You need to be logged in to see your order history.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='orders'>
        <div className='orders__loading'>
          <h1>Loading your orders...</h1>
          <p>Please wait while we fetch your order history.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='orders'>
        <div className='orders__error'>
          <h1>Error loading orders</h1>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='orders'>
      <h1>Your Orders</h1>
      
      {orders.length === 0 ? (
        <div className='orders__empty'>
          <h2>You haven't placed any orders yet</h2>
          <p>When you place your first order, it will appear here.</p>
        </div>
      ) : (
        <div className='orders__list'>
          {orders.map(order => (
            <Order 
              key={order.id} 
              order={order} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
