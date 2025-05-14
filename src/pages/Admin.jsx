// src/pages/Admin.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const [gifts, setGifts] = useState([]);
  const [items, setItems] = useState([]);
  const [players, setPlayers] = useState([]);

  const [newGift, setNewGift] = useState({
    name: '',
    description: '',
    useShort: '',
    useLong: '',
  });
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    image_url: '',
  });
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [error, setError] = useState('');

  const [viewGift, setViewGift] = useState(null);
  const [viewItem, setViewItem] = useState(null);

  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('session'));
    if (!session || session.role !== 'admin') {
      window.location.href = '/';
    } else {
      setAuthorized(true);
    }
  }, []);

  useEffect(() => {
    if (authorized) fetchPlayers();
  }, [authorized]);

  useEffect(() => {
    if (!selectedPlayer && !authorized) return;

    const fetchData = async () => {
      const { data: giftData } = await supabase
        .from('character_gifts')
        .select(
          'id, gift_id, gifts(id, name, description, uses_per_long_rest, uses_per_short_rest)',
        )
        .eq('character_id', selectedPlayer);

      const { data: itemData } = await supabase
        .from('character_items')
        .select('id, item_id, items(id, name, description, image_url)')
        .eq('character_id', selectedPlayer);

      if (giftData) setGifts(giftData);
      if (itemData) setItems(itemData);
    };

    fetchData();
  }, [selectedPlayer, authorized]);

  if (!authorized) return null;

  const fetchPlayers = async () => {
    const { data } = await supabase.from('characters').select('*');
    if (data) setPlayers(data);
  };

  const handleAddGift = async () => {
    setError('');
    if (!selectedPlayer) return setError('Selecione um personagem primeiro.');
    if (
      !newGift.name ||
      !newGift.description ||
      newGift.useShort === '' ||
      newGift.useLong === ''
    ) {
      return setError('Preencha todos os campos da dádiva.');
    }

    try {
      const { data: gift, error: giftError } = await supabase
        .from('gifts')
        .insert({
          name: newGift.name,
          description: newGift.description,
          uses_per_long_rest: newGift.useShort,
          uses_per_short_rest: newGift.useLong,
        })
        .select()
        .single();

      if (giftError) throw giftError;

      const { error: relationError } = await supabase
        .from('character_gifts')
        .insert({ character_id: selectedPlayer, gift_id: gift.id });

      if (relationError) throw relationError;

      setNewGift({ name: '', description: '', useShort: '', useLong: '' });

      const { data: updated } = await supabase
        .from('character_gifts')
        .select(
          'id, gift_id, gifts(id, name, description, uses_per_long_rest, uses_per_short_rest)',
        )
        .eq('character_id', selectedPlayer);
      if (updated) setGifts(updated);
    } catch (err) {
      console.error('Erro ao salvar dádiva:', err.message);
      setError('Erro ao salvar dádiva. Verifique os campos e tente novamente.');
    }
  };

  const handleAddItem = async () => {
    setError('');
    if (!selectedPlayer) return setError('Selecione um personagem primeiro.');
    if (!newItem.name || !newItem.description || !newItem.image_url) {
      return setError('Preencha todos os campos do item.');
    }

    const { data: item } = await supabase
      .from('items')
      .insert({
        name: newItem.name,
        description: newItem.description,
        image_url: newItem.image_url,
      })
      .select()
      .single();

    if (item) {
      await supabase
        .from('character_items')
        .insert({ character_id: selectedPlayer, item_id: item.id });
      setNewItem({ name: '', description: '', image_url: '' });
      const { data: updated } = await supabase
        .from('character_items')
        .select('id, item_id, items(id, name, description, image_url)')
        .eq('character_id', selectedPlayer);
      if (updated) setItems(updated);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-[#1c1a1a] text-white font-['MedievalSharp']">
      <h1 className="text-3xl text-yellow-300 mb-6">Painel do Mestre</h1>

      {error && (
        <div className="bg-red-800 text-red-200 border border-red-600 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {viewGift && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#2e2e2e] border border-yellow-800 p-6 rounded-xl max-w-md text-left">
            <h2 className="text-yellow-300 text-2xl mb-2">{viewGift.name}</h2>
            <p className="mb-2">{viewGift.description}</p>
            <p className="text-sm text-yellow-200">
              Usos por descanso curto: {viewGift.uses_per_long_rest}
            </p>
            <p className="text-sm text-yellow-200">
              Usos por descanso longo: {viewGift.uses_per_short_rest}
            </p>
            <button
              onClick={() => setViewGift(null)}
              className="mt-4 px-4 py-2 bg-yellow-700 text-black rounded hover:bg-yellow-800"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {viewItem && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#2e2e2e] border border-yellow-800 p-6 rounded-xl max-w-md text-left">
            <h2 className="text-yellow-300 text-2xl mb-2">{viewItem.name}</h2>
            <p className="mb-2">{viewItem.description}</p>
            {viewItem.image_url && (
              <img
                src={viewItem.image_url}
                alt={viewItem.name}
                className="mt-2 max-w-full rounded"
              />
            )}
            <button
              onClick={() => setViewItem(null)}
              className="mt-4 px-4 py-2 bg-yellow-700 text-black rounded hover:bg-yellow-800"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-[#2f2929] p-4 rounded-xl border border-yellow-800 shadow-md">
          <label className="block mb-2">Selecionar Jogador:</label>
          <select
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="w-full bg-[#1e1b1b] border border-yellow-700 p-2 rounded"
            defaultValue=""
          >
            <option value="" disabled>
              -- Escolha um personagem --
            </option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {gifts.length > 0 && (
            <div className="mt-6">
              <h3 className="text-yellow-400 mb-2 text-sm">
                Dádivas atribuídas:
              </h3>
              <ul className="text-sm text-yellow-100 space-y-1">
                {gifts.map((g) => (
                  <li key={g.id}>
                    <button
                      onClick={() => setViewGift(g.gifts)}
                      className="underline text-yellow-200 hover:text-yellow-400"
                    >
                      {g.gifts.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-6">
              <h3 className="text-yellow-400 mb-2 text-sm">
                Itens atribuídos:
              </h3>
              <ul className="text-sm text-yellow-100 space-y-1">
                {items.map((i) => (
                  <li key={i.id}>
                    <button
                      onClick={() => setViewItem(i.items)}
                      className="underline text-yellow-200 hover:text-yellow-400"
                    >
                      {i.items.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Registro de dádiva */}
        <div className="bg-[#2f2929] p-4 rounded-xl border border-yellow-800 shadow-md">
          <label className="block mb-1">Nova Dádiva:</label>
          <input
            type="text"
            placeholder="Nome"
            value={newGift.name}
            onChange={(e) => setNewGift({ ...newGift, name: e.target.value })}
            className="w-full mb-2 bg-[#1e1b1b] border border-yellow-700 p-2 rounded"
          />
          <textarea
            placeholder="Descrição"
            value={newGift.description}
            onChange={(e) =>
              setNewGift({ ...newGift, description: e.target.value })
            }
            className="w-full mb-2 bg-[#1e1b1b] border border-yellow-700 p-2 rounded"
          />
          <div className="flex gap-2 mb-2">
            <input
              type="number"
              placeholder="Usos Curto"
              value={newGift.useShort}
              onChange={(e) =>
                setNewGift({ ...newGift, useShort: e.target.value })
              }
              className="w-1/2 bg-[#1e1b1b] border border-yellow-700 p-2 rounded"
            />
            <input
              type="number"
              placeholder="Usos Longo"
              value={newGift.useLong}
              onChange={(e) =>
                setNewGift({ ...newGift, useLong: e.target.value })
              }
              className="w-1/2 bg-[#1e1b1b] border border-yellow-700 p-2 rounded"
            />
          </div>
          <button
            onClick={handleAddGift}
            className="bg-yellow-700 hover:bg-yellow-800 text-black py-2 px-4 rounded w-full"
          >
            Registrar Dádiva
          </button>

          {gifts.length > 0 && (
            <div className="mt-4">
              <h3 className="text-yellow-400 mb-2 text-sm">
                Dádivas atribuídas:
              </h3>
              <ul className="list-disc list-inside text-sm text-yellow-100">
                {gifts.map((g) => (
                  <li key={g.id}>{g.gifts.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Registro de item */}
        <div className="bg-[#2f2929] p-4 rounded-xl border border-yellow-800 shadow-md">
          <label className="block mb-1">Novo Item:</label>
          <input
            type="text"
            placeholder="Nome"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="w-full mb-2 bg-[#1e1b1b] border border-yellow-700 p-2 rounded"
          />
          <textarea
            placeholder="Descrição"
            value={newItem.description}
            onChange={(e) =>
              setNewItem({ ...newItem, description: e.target.value })
            }
            className="w-full mb-2 bg-[#1e1b1b] border border-yellow-700 p-2 rounded"
          />
          <input
            type="text"
            placeholder="URL da Imagem"
            value={newItem.image_url}
            onChange={(e) =>
              setNewItem({ ...newItem, image_url: e.target.value })
            }
            className="w-full mb-2 bg-[#1e1b1b] border border-yellow-700 p-2 rounded"
          />
          <button
            onClick={handleAddItem}
            className="bg-yellow-700 hover:bg-yellow-800 text-black py-2 px-4 rounded w-full"
          >
            Registrar Item
          </button>

          {items.length > 0 && (
            <div className="mt-4">
              <h3 className="text-yellow-400 mb-2 text-sm">
                Itens atribuídos:
              </h3>
              <ul className="list-disc list-inside text-sm text-yellow-100">
                {items.map((i) => (
                  <li key={i.id}>{i.items.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
