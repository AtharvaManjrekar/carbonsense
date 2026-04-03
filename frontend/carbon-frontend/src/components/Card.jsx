function Card({ title, children }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-5">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

export default Card;