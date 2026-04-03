import Navbar from "../components/Navbar";
import Card from "../components/Card";

function Sampling() {
  return (
    <div>
      <Navbar />
      <div className="p-6">
        <Card title="Sampling Techniques">
          <p>Random Sampling used for dataset selection.</p>
        </Card>
      </div>
    </div>
  );
}

export default Sampling;
