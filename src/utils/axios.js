import axios from 'axios';

// 创建axios实例
const instance = axios.create({
  // Supabase Edge Functions
  baseURL: 'https://zxyapebuxfkxbozezfnh.supabase.co/functions/v1'
});

export default instance;
