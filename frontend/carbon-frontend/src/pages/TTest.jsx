import Navbar from "../components/Navbar";
import Card from "../components/Card";
import { useEffect, useState } from "react";
import axios from "axios";

function TTest() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadResult = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("http://localhost:5000/t-test");
      setResult(res.data);
    } catch (loadError) {
      console.error("Failed to load T-test:", loadError);
      const message = loadError.response?.data?.error || "Could not load T-test results.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResult();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="p-6 space-y-6">
        <Card title="T-Test">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Two-sample Welch T-test comparing emission means for veg vs non-veg groups.
            </p>

            <button
              className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-60"
              onClick={loadResult}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh Result"}
            </button>

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          </div>
        </Card>

        {result && (
          <Card title="T-Test Result">
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Test:</strong> {result.test_name}</p>
              <p><strong>{result.group_a.name}</strong> | Size: {result.group_a.size} | Mean: {result.group_a.mean}</p>
              <p><strong>{result.group_b.name}</strong> | Size: {result.group_b.size} | Mean: {result.group_b.mean}</p>
              <p><strong>T-statistic:</strong> {result.t_statistic}</p>
              <p><strong>P-value:</strong> {result.p_value}</p>
              <p><strong>Alpha:</strong> {result.alpha}</p>
              <p className={result.significant ? "font-semibold text-green-700" : "font-semibold text-amber-700"}>
                {result.interpretation}
              </p>
            </div>
          </Card>
        )}

        {!loading && !result && !error && (
          <Card title="T-Test Result">
            <p className="text-sm text-gray-600">No result available.</p>
          </Card>
        )}

        <Card title="How To Read">
          <p className="text-sm text-gray-600">
            If p-value is less than 0.05, we treat the difference in means as statistically significant.
          </p>
        </Card>
      </div>
    </div>
  );
}

export default TTest;
