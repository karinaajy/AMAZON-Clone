import { createClient } from '@supabase/supabase-js'

// Supabase配置 - 无需邮箱验证
const supabaseUrl = 'https://zxyapebuxfkxbozezfnh.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4eWFwZWJ1eGZreGJvemV6Zm5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzA1MzgsImV4cCI6MjA3Mzc0NjUzOH0.8AH8-3CNrFbuKUGQxYIO2KI0Lfh7XVVUvVupVXK0PkQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// 认证相关函数
export const auth = {
  // 登录
  signInWithEmailAndPassword: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  // 注册 - 无需邮箱验证，立即可用
  createUserWithEmailAndPassword: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // 禁用邮箱重定向
      },
    })
    if (error) throw error

    // 如果注册成功但需要确认，自动登录
    if (data.user && !data.session) {
      // 尝试直接登录（适用于禁用邮箱验证的情况）
      const loginResult = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (loginResult.error) throw loginResult.error
      return loginResult.data
    }

    return data
  },

  // 登出
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // 监听认证状态变化
  onAuthStateChanged: (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null)
    })
  },

  // 获取当前用户
  getCurrentUser: () => {
    return supabase.auth.getUser()
  },
}

// 数据库相关函数
export const db = {
  // 保存订单
  saveOrder: async (userId, orderData) => {
    const { data, error } = await supabase.from('orders').insert({
      user_id: userId,
      payment_intent_id: orderData.payment_intent_id,
      basket: orderData.basket,
      amount: orderData.amount,
      created_at: orderData.created_at || new Date().toISOString(),
    })

    if (error) throw error
    return data
  },

  // 获取用户订单
  getUserOrders: async (userId) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // 实时监听订单变化
  subscribeToOrders: (userId, callback) => {
    return supabase
      .channel('orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        callback,
      )
      .subscribe()
  },
}
