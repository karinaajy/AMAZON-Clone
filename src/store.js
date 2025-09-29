import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Amazon Store using Zustand with persistence
export const useAmazonStore = create(
  persist(
    (set, get) => ({
  // 状态
  basket: [],
  user: null,

  // 购物车操作
  addToBasket: (item) => {
    console.log('ADD_TO_BASKET', item)
    set((state) => ({
      basket: [...state.basket, item]
    }))
  },

  removeFromBasket: (id) => {
    console.log('REMOVE_FROM_BASKET', id)
    set((state) => {
      const index = state.basket.findIndex((basketItem) => basketItem.id === id)
      let newBasket = [...state.basket]

      if (index >= 0) {
        newBasket.splice(index, 1)
      } else {
        console.warn(`Can't remove product (id: ${id}) as it's not in basket!`)
      }

      return { basket: newBasket }
    })
  },

  emptyBasket: () => {
    console.log('EMPTY_BASKET')
    set({ basket: [] })
  },

  // 用户操作
  setUser: (user) => {
    console.log('SET_USER', user)
    set({ user })
  },

  // 计算购物车总价 (helper function - 不要作为状态使用)
  getBasketTotal: () => {
    const { basket } = get()
    return basket?.reduce((amount, item) => item.price + amount, 0) || 0
  },
    }),
    {
      name: 'amazon-storage', // localStorage key
      storage: createJSONStorage(() => localStorage), // 使用localStorage
      partialize: (state) => ({ 
        basket: state.basket,
        user: state.user 
      }), // 只持久化basket和user
    }
  )
)

export default useAmazonStore
