function ChartBox({ title, img }) {
  return (
    <div className="bg-white shadow rounded-xl p-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      <img src={img} alt={title} className="w-full rounded" />
    </div>
  );
}

export default ChartBox;
