import Navbar from "../components/Navbar";
import Card from "../components/Card";

function Correlation() {
  return (
    <div>
      <Navbar />
      <div className="p-6">
        <Card title="Correlation Matrix">
          <img src="/correlation_matrix.png" alt="Correlation matrix" />
        </Card>

        <Card title="Simple Linear Regression">
          <img src="/slr.png" alt="Simple linear regression" />
        </Card>
      </div>
    </div>
  );
}

export default Correlation;
