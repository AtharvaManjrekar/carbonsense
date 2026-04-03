import Navbar from "../components/Navbar";
import Card from "../components/Card";

function PartialCorrelation() {
  return (
    <div>
      <Navbar />
      <div className="p-6">
        <Card title="Partial Correlation">
          <p>Correlation between travel & emission controlling electricity.</p>
        </Card>
      </div>
    </div>
  );
}

export default PartialCorrelation;