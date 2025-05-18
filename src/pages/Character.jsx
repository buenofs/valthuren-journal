import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import parse from 'html-react-parser';

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
  const [newItem, setNewItem] = useState(null);

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

    // Subscription to gifts channel for real-time updates
    const giftSubscription = supabase
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

    // Subscription to items channel for real-time updates
    const itemSubscription = supabase
      .channel('character_items')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'character_items',
          filter: `character_id=eq.${id}`,
        },
        (payload) => {
          const newItemId = payload.new.item_id;
          supabase
            .from('items')
            .select('*')
            .eq('id', newItemId)
            .single()
            .then(({ data }) => {
              if (data) {
                setNewItem(data);
                setItems((prev) => [
                  ...prev,
                  { id: payload.new.id, items: data },
                ]);
              }
            });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(giftSubscription);
      supabase.removeChannel(itemSubscription);
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
      className="min-h-screen px-4 py-6 bg-[#1a1816] text-white font-['MedievalSharp'] relative"
      style={{
        backgroundImage:
          "url('https://lyuoqsiipcstauszdazg.supabase.co/storage/v1/object/sign/ui/bg.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2M1YTkzNWVjLTc2NDAtNDdmMy04OTQyLWU0ZDQ3MDY4NjQ0ZiJ9.eyJ1cmwiOiJ1aS9iZy53ZWJwIiwiaWF0IjoxNzQ3NDg2MzcwLCJleHAiOjE3NzkwMjIzNzB9.YSU6SW5zs9ce39erVQJvyGco3gE42e67fyIdur0_qyw')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[#1a1816]/80 pointer-events-none backdrop-blur-none"></div>

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

        <div className="mt-6">
          <div className="bg-[#262121]/80 backdrop-blur-md rounded-lg p-4 border border-yellow-700 w-full mb-4">
            <h2 className="text-yellow-400 text-xl mb-2 font-semibold border-b border-yellow-700 pb-2">
              Dádivas
            </h2>
            {sortedGifts.length > 0 ? (
              <ul className="space-y-1">
                {sortedGifts.map((g) => (
                  <li key={g.id} className="relative w-full">
                    <button
                      onClick={() => setViewGift(g.gifts)}
                      className="w-full text-left text-lg text-yellow-200 hover:text-yellow-100 hover:underline py-1 px-2 rounded-md"
                    >
                      {g.gifts.name}
                    </button>
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

          {/* Itens Únicos - Full Width, No Cards */}
          <div className="bg-[#262121]/80 backdrop-blur-md rounded-lg p-4 border border-yellow-700 w-full">
            <h2 className="text-yellow-400 text-xl mb-2 font-semibold border-b border-yellow-700 pb-2">
              Itens Únicos
            </h2>
            {sortedItems.length > 0 ? (
              <ul className="space-y-3">
                {sortedItems.map((i) => (
                  <li key={i.id} className="relative w-full">
                    <button
                      onClick={() => setViewItem(i.items)}
                      className="w-full text-left text-lg text-yellow-200 hover:text-yellow-100 hover:underline py-3 px-4 rounded-md"
                    >
                      {i.items.name}
                    </button>
                    {newItem && newItem.id === i.items.id && (
                      <span className="absolute top-0 right-0 text-sm text-yellow-400 animate-pulse">
                        NOVO!
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-yellow-100">Nenhum item registrado.</p>
            )}
          </div>
        </div>
      </div>

      {/* Popup da Dádiva */}
      {viewGift && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#2e2e2e]/80 backdrop-blur-md border border-yellow-800 p-6 rounded-xl w-11/12 max-w-md text-left max-h-screen overflow-y-auto">
            <h2 className="text-yellow-300 text-2xl mb-2 font-bold">
              {viewGift.name}
            </h2>
            <div className="prose prose-invert max-w-none text-yellow-100 text-sm tiptap space-y-4 [&_p]:my-2">
              {parse(viewGift.description)}
            </div>
            {viewGift.uses_per_short_rest > 0 && (
              <p className="text-sm text-yellow-200 mt-4">
                Usos por descanso curto: {viewGift.uses_per_short_rest}
              </p>
            )}
            {viewGift.uses_per_long_rest > 0 && (
              <p className="text-sm text-yellow-200 mt-4">
                Usos por descanso longo: {viewGift.uses_per_long_rest}
              </p>
            )}
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

      {/* Popup do Item */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e]/80 backdrop-blur-md border border-yellow-800 p-6 rounded-xl w-11/12 max-w-md text-left max-h-screen overflow-y-auto">
            <h2 className="text-yellow-300 text-2xl mb-2 font-bold">
              {viewItem.name}
            </h2>
            <div className="prose prose-invert max-w-none text-yellow-100 text-sm tiptap space-y-4 [&_p]:my-2">
              {parse(viewItem.description)}
            </div>
            {viewItem.image_url && (
              <img
                src={viewItem.image_url}
                alt={viewItem.name}
                className="mt-4 max-w-[90%] max-h-[200px] mx-auto object-contain rounded border border-yellow-700 shadow"
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
