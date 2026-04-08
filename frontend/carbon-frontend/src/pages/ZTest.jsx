import Navbar from "../components/Navbar";
import Card from "../components/Card";
import { useEffect, useState } from "react";
import axios from "axios";

function ZTest() {
  const [sampleSize, setSampleSize] = useState(1000);
  const [seed, setSeed] = useState(42);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadResult = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("http://localhost:5000/z-test", {
        params: {
          sample_size: Number(sampleSize),
          random_seed: Number(seed),
        },
      });
      setResult(res.data);
    } catch (loadError) {
      console.error("Failed to load Z-test:", loadError);
      const message = loadError.response?.data?.error || "Could not load Z-test results.";
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
        <Card title="Z-Test">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              One-sample Z-test comparing a random sample emission mean with the dataset population mean.
            </p>

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Sample Size</label>
                <input
                  type="number"
                  min={2}
                  className="w-full rounded border p-2"
                  value={sampleSize}
                  onChange={(e) => setSampleSize(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Random Seed</label>
                <input
                  type="number"
                  className="w-full rounded border p-2"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                />
              </div>
            </div>

            <button
              className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-60"
              onClick={loadResult}
              disabled={loading}
            >
              {loading ? "Loading..." : "Run Z-Test"}
            </button>

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          </div>
        </Card>

        {result && (
          <Card title="Z-Test Result">
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Test:</strong> {result.test_name}</p>
              <p><strong>Sample Size:</strong> {result.sample_size} / Population Size: {result.population_size}</p>
              <p><strong>Sample Mean:</strong> {result.sample_mean}</p>
              <p><strong>Population Mean:</strong> {result.population_mean}</p>
              <p><strong>Sample Std:</strong> {result.sample_std}</p>
              <p><strong>Z value:</strong> {result.z_value}</p>
              <p><strong>Two-tailed P-value:</strong> {result.p_value_two_tailed}</p>
              <p><strong>Alpha:</strong> {result.alpha}</p>
              <p className={result.significant ? "font-semibold text-green-700" : "font-semibold text-amber-700"}>
                {result.interpretation}
              </p>
            </div>
          </Card>
        )}

        {!loading && !result && !error && (
          <Card title="Z-Test Result">
            <p className="text-sm text-gray-600">No result available.</p>
          </Card>
        )}

        <Card title="How To Read">
          <p className="text-sm text-gray-600">
            If p-value is less than 0.05, the sample mean is considered significantly different from the population mean.
          </p>
        </Card>
      </div>
    </div>
  );
}

export default ZTest;
