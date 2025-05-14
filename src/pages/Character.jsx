import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Character() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [character, setCharacter] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [items, setItems] = useState([]);
  const [viewGift, setViewGift] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newGift, setNewGift] = useState(null);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('session'));
    if (!session || session.role !== 'player' || session.characterId !== id) {
      navigate('/');
    } else {
      setAuthorized(true);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!authorized) return;

    const fetchData = async () => {
      const { data: charData } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single();

      const { data: giftData } = await supabase
        .from('character_gifts')
        .select(
          'id, gifts(id, name, description, uses_per_short_rest, uses_per_long_rest)',
        )
        .eq('character_id', id);

      const { data: itemData } = await supabase
        .from('character_items')
        .select('id, items(id, name, description, image_url)')
        .eq('character_id', id);

      if (charData) setCharacter(charData);
      if (giftData) setGifts(giftData);
      if (itemData) setItems(itemData);

      setLoading(false);
    };

    fetchData();

    const subscription = supabase
      .channel('character_gifts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'character_gifts',
          filter: `character_id=eq.${id}`,
        },
        (payload) => {
          const newGiftId = payload.new.gift_id;
          supabase
            .from('gifts')
            .select('*')
            .eq('id', newGiftId)
            .single()
            .then(({ data }) => {
              if (data) {
                // Marca a nova dádiva e a adiciona à lista
                setNewGift(data);
                setGifts((prev) => [
                  ...prev,
                  { id: payload.new.id, gifts: data },
                ]);
              }
            });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [authorized, id]);

  if (!authorized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1816] text-white font-['MedievalSharp']">
        <div className="text-center">
          <h2 className="text-yellow-300 text-xl">Carregando...</h2>
        </div>
      </div>
    );
  }

  if (!character) return null;

  const sortedGifts = [...gifts].sort((a, b) =>
    a.gifts.name.localeCompare(b.gifts.name),
  );
  const sortedItems = [...items].sort((a, b) =>
    a.items.name.localeCompare(b.items.name),
  );

  return (
    <div
      className="min-h-screen px-4 py-6 bg-[#1a1816] text-white font-['MedievalSharp'] relative overflow-hidden"
      style={{
        backgroundImage: "url('/ui/bg.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[#1a1816]/80 pointer-events-none backdrop-blur-xs"></div>

      <div className="relative max-w-3xl mx-auto text-center">
        <div className="flex flex-col items-center">
          <img
            src={character.image_url || '/avatars/unknown.png'}
            alt={character.name}
            className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-yellow-600 object-cover shadow-lg"
          />
          <h1 className="text-4xl mt-4 font-bold text-yellow-300 drop-shadow-md">
            {character.name}
          </h1>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#262121]/80 backdrop-blur-md rounded-xl shadow-lg p-4 border border-yellow-700">
            <h2 className="text-yellow-400 text-xl mb-4 font-semibold border-b border-yellow-700 pb-2">
              Dádivas
            </h2>
            {sortedGifts.length > 0 ? (
              <ul className="space-y-2">
                {sortedGifts.map((g) => (
                  <li key={g.id} className="relative">
                    <button
                      onClick={() => setViewGift(g.gifts)}
                      className="text-left w-full text-yellow-200 hover:text-yellow-100 hover:underline"
                    >
                      {g.gifts.name}
                    </button>
                    {/* Mostra o "New!" piscando se for a nova dádiva */}
                    {newGift && newGift.id === g.gifts.id && (
                      <span className="absolute top-0 right-0 text-sm text-yellow-400 animate-pulse">
                        NOVO!
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-yellow-100">
                Nenhuma dádiva encontrada.
              </p>
            )}
          </div>

          <div className="bg-[#262121]/80 backdrop-blur-md rounded-xl shadow-lg p-4 border border-yellow-700">
            <h2 className="text-yellow-400 text-xl mb-4 font-semibold border-b border-yellow-700 pb-2">
              Itens Únicos
            </h2>
            {sortedItems.length > 0 ? (
              <ul className="space-y-2">
                {sortedItems.map((i) => (
                  <li key={i.id}>
                    <button
                      onClick={() => setViewItem(i.items)}
                      className="text-left w-full text-yellow-200 hover:text-yellow-100 hover:underline"
                    >
                      {i.items.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-yellow-100">Nenhum item registrado.</p>
            )}
          </div>
        </div>
      </div>

      {viewGift && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e]/80 backdrop-blur-md border border-yellow-800 p-6 rounded-xl w-11/12 max-w-md text-left">
            <h2 className="text-yellow-300 text-2xl mb-2 font-bold">
              {viewGift.name}
            </h2>
            <p className="mb-4 text-sm text-yellow-100">
              {viewGift.description}
            </p>
            <p className="text-sm text-yellow-200">
              Descanso curto: {viewGift.uses_per_short_rest}
            </p>
            <p className="text-sm text-yellow-200">
              Descanso longo: {viewGift.uses_per_long_rest}
            </p>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewGift(null)}
                className="px-4 py-2 bg-yellow-700 text-black font-bold rounded hover:bg-yellow-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {viewItem && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e]/80 backdrop-blur-md border border-yellow-800 p-6 rounded-xl w-11/12 max-w-md text-left">
            <h2 className="text-yellow-300 text-2xl mb-2 font-bold">
              {viewItem.name}
            </h2>
            <p className="mb-4 text-sm text-yellow-100">
              {viewItem.description}
            </p>
            {viewItem.image_url && (
              <img
                src={viewItem.image_url}
                alt={viewItem.name}
                className="mt-2 w-full rounded border border-yellow-700"
              />
            )}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewItem(null)}
                className="px-4 py-2 bg-yellow-700 text-black font-bold rounded hover:bg-yellow-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
