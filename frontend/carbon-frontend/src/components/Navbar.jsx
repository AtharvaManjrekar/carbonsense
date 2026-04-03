import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="bg-green-600 text-white p-4 flex justify-between">
      <h1 className="font-bold text-lg">CarbonSense 🌍</h1>

      <div className="space-x-4 hidden md:flex">
        <Link to="/">Home</Link>
        <Link to="/visualization">Visualization</Link>
        <Link to="/correlation">Correlation</Link>
        <Link to="/mlr">MLR</Link>
        <Link to="/mle">MLE</Link>
        <Link to="/predict">Predict</Link>
      </div>
    </div>
  );
}

export default Navbar;
