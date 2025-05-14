// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const characters = [
  { name: 'Thebryan', image: '/avatars/thebryan.png' },
  { name: 'Thytus', image: '/avatars/thytus.png' },
  { name: 'Toji', image: '/avatars/toji.png' },
  { name: 'Talik', image: '/avatars/talik.png' },
  { name: 'Danstão', image: '/avatars/danstao.png' },
  { name: '???', image: '/avatars/unknown.png' },
];

export default function Login() {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [pin, setPin] = useState('');
  const [step, setStep] = useState('select');
  const [showPad, setShowPad] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSelectCharacter = async (charName) => {
    setError('');
    const { data } = await supabase
      .from('characters')
      .select('*')
      .eq('name', charName)
      .single();

    if (data) {
      setSelectedCharacter(data);
      setStep(data.has_pin ? 'enter' : 'register');
      setPin('');
      setShowPad(true);
    }
  };

  const handleSubmitPin = async () => {
    setError('');
    if (pin.length !== 6) {
      setError('O PIN deve ter 6 dígitos.');
      return;
    }

    const bcrypt = await import('bcryptjs');
    if (step === 'register') {
      const hash = bcrypt.hashSync(pin, 10);
      await supabase
        .from('characters')
        .update({ pin_hash: hash, has_pin: true })
        .eq('id', selectedCharacter.id);

      if (selectedCharacter.name === '???') {
        localStorage.setItem('session', JSON.stringify({ role: 'admin' }));
        navigate('/admin');
      } else {
        localStorage.setItem(
          'session',
          JSON.stringify({
            role: 'player',
            characterId: selectedCharacter.id,
          }),
        );
        navigate(`/character/${selectedCharacter.id}`);
      }
    } else {
      const valid = bcrypt.compareSync(pin, selectedCharacter.pin_hash);
      if (valid) {
        if (selectedCharacter.name === '???') {
          localStorage.setItem('session', JSON.stringify({ role: 'admin' }));
          navigate('/admin');
        } else {
          localStorage.setItem(
            'session',
            JSON.stringify({
              role: 'player',
              characterId: selectedCharacter.id,
            }),
          );
          navigate(`/character/${selectedCharacter.id}`);
        }
      } else {
        setError('Código errado, não me decepcione.');
      }
    }
  };

  const addDigit = (digit) => {
    if (pin.length < 6) setPin((prev) => prev + digit);
  };

  const removeDigit = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1816] to-[#13110f] text-white font-['MedievalSharp'] text-base p-6">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl text-yellow-300 pb-4 mb-6">Quem é você?</h1>

        {step === 'select' && (
          <div className="grid grid-cols-2 gap-6">
            {characters.map((char) => (
              <button
                key={char.name}
                onClick={() => handleSelectCharacter(char.name)}
                className="relative bg-[#2d2620] rounded-xl shadow-lg p-4 active:scale-95 transition-transform border border-yellow-800 overflow-hidden"
              >
                <img
                  src={char.image}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover opacity-20 scale-150 z-0"
                />
                <div className="relative z-10">
                  {char.name === '???' ? (
                    <div className="relative w-24 h-24 mx-auto mb-2">
                      <div className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-pulse blur-md opacity-40 z-20 shadow-yellow-400/50 shadow-lg"></div>
                      <img
                        src={char.image}
                        alt={char.name}
                        className="relative w-full h-full border-2 border-yellow-600 rounded-full object-cover z-30"
                      />
                    </div>
                  ) : (
                    <img
                      src={char.image}
                      alt={char.name}
                      className="w-24 h-24 mx-auto mb-2 border-2 border-yellow-600 rounded-full object-cover"
                    />
                  )}
                  <p className="text-yellow-100 text-lg">{char.name}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {showPad && (
          <div className="mt-10 space-y-6 bg-[#2f2929] rounded-xl shadow-xl border border-yellow-800 p-6">
            <p className="text-yellow-200 text-2xl">
              {step === 'register' ? 'Crie seu PIN' : 'Digite seu PIN'}
            </p>

            {error && (
              <p className="text-red-400 bg-[#3a1f1f] p-2 rounded-md border border-red-500">
                {error}
              </p>
            )}

            {/* Caixa de PIN com animação moderna */}
            <div className="flex justify-center space-x-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 sm:w-10 sm:h-10 border-2 rounded-md transition duration-300 ease-in-out transform ${
                    pin[i]
                      ? 'bg-yellow-400 border-yellow-600 scale-105'
                      : 'border-yellow-500 bg-[#2f2929]'
                  } shadow-md`}
                ></div>
              ))}
            </div>

            {/* Teclado de entrada */}
            <div className="grid grid-cols-3 gap-3 w-4/5 mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '←', 0, '✓'].map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    if (val === '←') return removeDigit();
                    if (val === '✓') return handleSubmitPin();
                    addDigit(val.toString());
                  }}
                  className="bg-yellow-700 border border-yellow-800 text-black font-bold py-3 rounded-md active:scale-95 active:bg-yellow-800 transition-transform shadow-md hover:bg-yellow-600"
                >
                  {val}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setStep('select');
                setSelectedCharacter(null);
                setPin('');
                setShowPad(false);
                setError('');
              }}
              className="text-yellow-300 underline mt-4"
            >
              Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
