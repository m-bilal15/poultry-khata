'use client';

import { useShop } from '@/hooks/useShop';
import { useState } from 'react';

export function ShopSelector() {
  const { shops, selectedShop, setSelectedShop, createShop } = useShop();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const shop = await createShop(newName.trim(), newAddress.trim());
    if (shop) setSelectedShop(shop.id);
    setNewName('');
    setNewAddress('');
    setShowAdd(false);
  };

  if (shops.length === 0 && !showAdd) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <p className="text-gray-500">کوئی دکان نہیں ملی</p>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold text-lg"
        >
          + دکان شامل کریں
        </button>
        {showAdd && (
          <div className="w-full max-w-sm bg-white rounded-2xl p-4 shadow-lg mt-2">
            <input
              className="w-full border rounded-xl p-3 mb-2 text-lg"
              placeholder="دکان کا نام"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              className="w-full border rounded-xl p-3 mb-3 text-lg"
              placeholder="پتہ (اختیاری)"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
            />
            <button
              onClick={handleAdd}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-lg"
            >
              محفوظ کریں
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {shops.map((shop) => (
        <button
          key={shop.id}
          onClick={() => setSelectedShop(shop.id)}
          className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
            selectedShop?.id === shop.id
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {shop.name}
        </button>
      ))}
      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 text-sm font-semibold"
        >
          + دکان
        </button>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            className="border rounded-xl px-3 py-2 text-sm"
            placeholder="دکان کا نام"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <button
            onClick={handleAdd}
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold"
          >
            شامل
          </button>
          <button
            onClick={() => { setShowAdd(false); setNewName(''); }}
            className="text-gray-400 px-2 py-2"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
