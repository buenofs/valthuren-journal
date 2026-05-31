import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const characters = [
  {
    name: "Thebryan",
    image:
      "https://dxtglgwqrqwgfhlgzqqw.supabase.co/storage/v1/object/public/characters/thebryan.png?width=300&quality=70",
  },
  {
    name: "Tythos",
    image:
      "https://dxtglgwqrqwgfhlgzqqw.supabase.co/storage/v1/object/public/characters/thytus.png?width=300&quality=70",
  },
  {
    name: "Toji",
    image:
      "https://dxtglgwqrqwgfhlgzqqw.supabase.co/storage/v1/object/public/characters/toji.png?width=300&quality=70",
  },
  {
    name: "Talik",
    image:
      "https://dxtglgwqrqwgfhlgzqqw.supabase.co/storage/v1/object/public/characters/talik.png?width=300&quality=70",
  },
  {
    name: "Danstão",
    image:
      "https://dxtglgwqrqwgfhlgzqqw.supabase.co/storage/v1/object/public/characters/danstao.png?width=300&quality=70",
  },
  {
    name: "???",
    image:
      "https://dxtglgwqrqwgfhlgzqqw.supabase.co/storage/v1/object/public/characters/unknown.png?width=300&quality=70",
  },
];

const totalImages = characters.length;

export default function Login() {
  const [pin, setPin] = useState("");
  const [showPad, setShowPad] = useState(false);
  const [adminCharacter, setAdminCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let loadedImages = 0;
    characters.forEach((char) => {
      const img = new Image();
      img.src = char.image;
      img.onload = () => {
        loadedImages++;
        if (loadedImages === totalImages) setLoading(false);
      };
      img.onerror = () => {
        loadedImages++;
        if (loadedImages === totalImages) setLoading(false);
      };
    });
  }, []);

  const handleSelectCharacter = async (charName) => {
    setError("");

    const { data } = await supabase
      .from("characters")
      .select("*")
      .eq("name", charName)
      .single();

    if (!data) return;

    if (charName === "???") {
      setAdminCharacter(data);
      setPin("");
      setShowPad(true);
    } else {
      navigate(`/character/${data.id}`);
    }
  };

  const handleSubmitPin = async () => {
    setError("");
    if (pin.length !== 6) {
      setError("O PIN deve ter 6 dígitos.");
      return;
    }

    const bcrypt = await import("bcryptjs");

    if (!adminCharacter.has_pin) {
      const hash = bcrypt.hashSync(pin, 10);
      await supabase
        .from("characters")
        .update({ pin_hash: hash, has_pin: true })
        .eq("id", adminCharacter.id);
      localStorage.setItem("session", JSON.stringify({ role: "admin" }));
      navigate("/admin");
    } else {
      const valid = bcrypt.compareSync(pin, adminCharacter.pin_hash);
      if (valid) {
        localStorage.setItem("session", JSON.stringify({ role: "admin" }));
        navigate("/admin");
      } else {
        setError("Código errado, não me decepcione.");
      }
    }
  };

  const addDigit = (digit) => {
    if (pin.length < 6) setPin((prev) => prev + digit);
  };

  const removeDigit = () => setPin((prev) => prev.slice(0, -1));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1816] text-white font-['MedievalSharp']">
        <div className="text-center">
          <h2 className="text-yellow-300 text-xl">Carregando...</h2>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#1a1816] to-[#13110f] text-white font-['MedievalSharp'] text-base p-6"
      style={{
        backgroundImage:
          "url('https://dxtglgwqrqwgfhlgzqqw.supabase.co/storage/v1/object/public/ui/bg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-[#1a1816]/80 backdrop-blur-none z-0 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        <h1 className="text-4xl text-yellow-300 font-['MedievalSharp']">
          Quem é você?
        </h1>

        {!showPad && (
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
                  {char.name === "???" ? (
                    <div className="relative w-24 h-24 mx-auto mb-2">
                      <div className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-pulse blur-md opacity-40 z-20 shadow-yellow-400/50 shadow-lg" />
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
          <div className="bg-[#2f2929] rounded-xl shadow-xl border border-yellow-800 p-6">
            <p className="text-yellow-200 text-2xl">
              {adminCharacter?.has_pin ? "Digite seu PIN" : "Crie seu PIN"}
            </p>

            {error && (
              <p className="text-red-400 bg-[#3a1f1f] p-2 rounded-md border border-red-500">
                {error}
              </p>
            )}

            <div className="flex justify-center space-x-2 mt-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 sm:w-10 sm:h-10 border-2 rounded-md transition duration-300 ease-in-out transform ${
                    pin[i]
                      ? "bg-yellow-400 border-yellow-600 scale-105"
                      : "border-yellow-500 bg-[#2f2929]"
                  } shadow-md`}
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 w-4/5 mx-auto mt-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, "←", 0, "✓"].map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    if (val === "←") return removeDigit();
                    if (val === "✓") return handleSubmitPin();
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
                setShowPad(false);
                setAdminCharacter(null);
                setPin("");
                setError("");
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
