'use client';

import { useStore } from '@/store/useStore';
import { Shop } from '@/types';
import { supabase } from '@/lib/supabase';
import { queueOperation } from '@/lib/offline';

export function useShop() {
  const { shops, selectedShopId, setSelectedShop, addShop, updateShop, isOnline } = useStore();

  const selectedShop = shops.find((s) => s.id === selectedShopId) || shops[0] || null;

  const createShop = async (name: string, address: string): Promise<Shop | null> => {
    const newShop: Shop = {
      id: crypto.randomUUID(),
      name,
      address,
      user_id: 'local',
    };

    addShop(newShop);

    if (isOnline) {
      const { data, error } = await supabase.from('shops').insert(newShop).select().single();
      if (!error && data) return data;
    } else {
      await queueOperation({ table: 'shops', operation: 'insert', data: newShop });
    }

    return newShop;
  };

  const editShop = async (shop: Shop): Promise<void> => {
    updateShop(shop);
    if (isOnline) {
      await supabase.from('shops').update(shop).eq('id', shop.id);
    } else {
      await queueOperation({ table: 'shops', operation: 'update', data: shop });
    }
  };

  return { shops, selectedShop, selectedShopId, setSelectedShop, createShop, editShop };
}
