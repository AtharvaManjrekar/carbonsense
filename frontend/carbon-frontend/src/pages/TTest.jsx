import Navbar from "../components/Navbar";
import Card from "../components/Card";

function TTest() {
  return (
    <div>
      <Navbar />
      <div className="p-6">
        <Card title="T-Test">
          <p>One-tailed & Two-tailed test results shown here.</p>
        </Card>
      </div>
    </div>
  );
}

export default TTest;