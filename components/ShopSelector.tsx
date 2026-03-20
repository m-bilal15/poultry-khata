'use client';

import { useShop } from '@/hooks/useShop';
import { useT } from '@/hooks/useT';
import { useState } from 'react';

export function ShopSelector() {
  const { shops, selectedShop, setSelectedShop, createShop } = useShop();
  const { t } = useT();
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
      <div className="bg-white rounded-3xl p-6 text-center shadow-sm border border-green-100">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
          </svg>
        </div>
        <p className="text-gray-600 font-semibold mb-1">{t('noShopFound')}</p>
        <p className="text-gray-400 text-sm mb-4">{t('addShopFirst')}</p>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold text-base w-full"
          style={{ boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}
        >
          {t('addShop')}
        </button>
      </div>
    );
  }

  if (showAdd && shops.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-700 mb-4 text-lg">{t('newShop')}</h3>
        <input
          className="w-full border border-gray-200 rounded-2xl px-4 py-3 mb-3 text-base bg-gray-50"
          placeholder={t('shopNameReq')}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          autoFocus
        />
        <input
          className="w-full border border-gray-200 rounded-2xl px-4 py-3 mb-4 text-base bg-gray-50"
          placeholder={t('address')}
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
        />
        <button
          onClick={handleAdd}
          className="w-full bg-green-600 text-white py-3.5 rounded-2xl font-bold text-base"
          style={{ boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}
        >
          {t('save')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {shops.map((shop) => (
        <button
          key={shop.id}
          onClick={() => setSelectedShop(shop.id)}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
            selectedShop?.id === shop.id
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
          style={selectedShop?.id === shop.id ? { boxShadow: '0 4px 12px rgba(22,163,74,0.25)' } : {}}
        >
          {shop.name}
        </button>
      ))}
      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 rounded-2xl bg-white border border-dashed border-gray-300 text-gray-400 text-sm font-semibold"
        >
          {t('addShopShort')}
        </button>
      ) : (
        <div className="flex items-center gap-2 bg-white rounded-2xl p-2 border border-green-200 flex-1 min-w-0">
          <button onClick={() => { setShowAdd(false); setNewName(''); }} className="text-gray-300 p-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <input
            className="flex-1 min-w-0 text-sm bg-transparent outline-none px-1"
            placeholder={t('shopName')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <button onClick={handleAdd} className="bg-green-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shrink-0">
            {t('add')}
          </button>
        </div>
      )}
    </div>
  );
}
