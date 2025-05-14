function CharacterCard({ name, avatar, description }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-sm shadow-xl">
      <img
        src={avatar}
        alt={name}
        className="w-24 h-24 rounded-full mx-auto border-4 border-purple-600"
      />
      <h2 className="text-2xl font-semibold text-center mt-4">{name}</h2>
      <p className="text-sm text-gray-300 text-center mt-2">{description}</p>
    </div>
  );
}

export default CharacterCard;
