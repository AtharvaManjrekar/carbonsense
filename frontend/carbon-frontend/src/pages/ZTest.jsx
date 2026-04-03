import Navbar from "../components/Navbar";
import Card from "../components/Card";

function ZTest() {
  return (
    <div>
      <Navbar />
      <div className="p-6">
        <Card title="Z-Test">
          <p>One-sample & Two-sample Z-test analysis.</p>
        </Card>
      </div>
    </div>
  );
}

export default ZTest;
