import React, { useState, useEffect, useRef } from 'react'
import './Payment.css'
import { useAmazonStore } from '../../store'
import CheckoutProduct from '../../components/CheckoutProduct'
import { Link, useNavigate } from 'react-router-dom'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { NumericFormat } from 'react-number-format'
import axios from '../../utils/axios'
import { db } from '../../supabase'

function Payment() {
  const navigate = useNavigate()
  const basket = useAmazonStore((state) => state.basket)
  const user = useAmazonStore((state) => state.user)
  const getBasketTotal = useAmazonStore((state) => state.getBasketTotal)
  const emptyBasket = useAmazonStore((state) => state.emptyBasket)

  const stripe = useStripe()
  const elements = useElements()
  
  // 用于跟踪组件是否已卸载
  const isMountedRef = useRef(true)

  const [succeeded, setSucceeded] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [disabled, setDisabled] = useState(true)
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    // 组件卸载时清理
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    // 生成Stripe客户端密钥
    const getClientSecret = async () => {
      if (basket.length === 0) return

      try {
        const response = await axios({
          method: 'post',
          url: `/payments/create?total=${getBasketTotal() * 100}`, // Stripe以分为单位
        })

        // 只有在组件仍然挂载时才更新状态
        if (isMountedRef.current) {
          setClientSecret(response.data.client_secret)
        }
      } catch (error) {
        console.error('Error creating payment intent:', error)
        // 只有在组件仍然挂载时才更新状态
        if (isMountedRef.current) {
          setError('Unable to process payment. Please try again.')
        }
      }
    }

    getClientSecret()
  }, [basket, getBasketTotal])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    // 检查组件是否仍然挂载
    if (!isMountedRef.current) {
      return
    }

    setProcessing(true)

    try {
      const cardElement = elements.getElement(CardElement)

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        },
      )

      // 检查组件是否仍然挂载
      if (!isMountedRef.current) {
        return
      }

      if (error) {
        setError(`Payment failed: ${error.message}`)
        setProcessing(false)
      } else {
        // 支付成功，保存订单
        if (user) {
          try {
            // 临时保存到localStorage，直到Supabase表创建完成
            const order = {
              id: paymentIntent.id,
              user_id: user.id,
              payment_intent_id: paymentIntent.id,
              basket: basket,
              amount: paymentIntent.amount,
              created_at: new Date(paymentIntent.created * 1000).toISOString(),
            }
            
            // 保存到localStorage作为备份
            const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
            existingOrders.push(order)
            localStorage.setItem('orders', JSON.stringify(existingOrders))
            
            console.log('Order saved to localStorage:', order)
            
            // 尝试保存到Supabase（如果表存在）
            try {
              await db.saveOrder(user.id, order)
              console.log('Order saved to Supabase successfully')
            } catch (dbError) {
              console.log('Supabase table not ready, order saved locally:', dbError.message)
            }
          } catch (error) {
            console.error('Error saving order:', error)
          }
        }

        // 再次检查组件是否仍然挂载
        if (!isMountedRef.current) {
          return
        }

        setError(null)
        setProcessing(false)
        setSucceeded(true)

        // 清空购物车
        emptyBasket()

        // 跳转到订单页面
        setTimeout(() => {
          if (isMountedRef.current) {
            navigate('/orders')
          }
        }, 3000)
      }
    } catch (err) {
      // 处理任何未预期的错误
      if (isMountedRef.current) {
        setError('An unexpected error occurred. Please try again.')
        setProcessing(false)
      }
    }
  }

  const handleChange = (event) => {
    setDisabled(event.empty)
    setError(event.error ? event.error.message : '')
  }

  if (succeeded) {
    return (
      <div className='payment'>
        <div className='payment__success'>
          <h1>Payment Successful! 🎉</h1>
          <p>Your order has been confirmed and will be processed shortly.</p>
          <p>Redirecting to your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='payment'>
      <div className='payment__container'>
        <h1>
          Checkout (<Link to='/checkout'>{basket?.length} items</Link>)
        </h1>

        {/* Payment method */}
        <div className='payment__section'>
          <div className='payment__title'>
            <h3>Payment Method</h3>
          </div>
          <div className='payment__details'>
            <form onSubmit={handleSubmit}>
              <CardElement
                onChange={handleChange}
                options={{
                  hidePostalCode: true, // 隐藏邮编输入
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />

              <div className='payment__priceContainer'>
                <NumericFormat
                  renderText={(value) => <h3>Order Total: {value}</h3>}
                  decimalScale={2}
                  value={getBasketTotal()}
                  displayType={'text'}
                  thousandSeparator={true}
                  prefix={'$'}
                />
                <button
                  disabled={processing || disabled || succeeded}
                  type='submit'
                >
                  <span>{processing ? <p>Processing</p> : 'Buy Now'}</span>
                </button>
              </div>

              {error && <div className='payment__error'>{error}</div>}
            </form>
          </div>
        </div>

        {/* Delivery address */}
        <div className='payment__section'>
          <div className='payment__title'>
            <h3>Delivery Address</h3>
          </div>
          <div className='payment__address'>
            <p>{user?.email}</p>
            <p>123 React Lane</p>
            <p>Los Angeles, CA</p>
          </div>
        </div>

        {/* Review Items */}
        <div className='payment__section'>
          <div className='payment__title'>
            <h3>Review items and delivery</h3>
          </div>
          <div className='payment__items'>
            {basket.map((item, index) => (
              <CheckoutProduct
                key={`${item.id}-${index}`}
                id={item.id}
                title={item.title}
                image={item.image}
                price={item.price}
                rating={item.rating}
                hideButton
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment
