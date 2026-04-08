import Navbar from "../components/Navbar";
import Card from "../components/Card";
import { useEffect, useState } from "react";
import axios from "axios";

function formatValue(value) {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? value : value.toFixed(4);
  }

  return String(value);
}

function Sampling() {
  const [techniques, setTechniques] = useState([]);
  const [selectedTechnique, setSelectedTechnique] = useState("random");
  const [sampleSize, setSampleSize] = useState(50);
  const [seed, setSeed] = useState(42);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTechniques = async () => {
      try {
        const res = await axios.get("http://localhost:5000/sampling-techniques");
        const options = res.data.techniques ?? [];
        setTechniques(options);
        if (options.length > 0) {
          setSelectedTechnique(options[0].key);
        }
      } catch (loadError) {
        console.error("Failed to load sampling techniques:", loadError);
        setError("Could not load sampling techniques. Please make sure backend is running.");
      }
    };

    loadTechniques();
  }, []);

  const runSampling = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.post("http://localhost:5000/sampling", {
        technique: selectedTechnique,
        sample_size: Number(sampleSize),
        random_seed: Number(seed),
        preview_limit: 15,
      });
      setResult(res.data);
    } catch (samplingError) {
      console.error("Sampling failed:", samplingError);
      const backendError = samplingError.response?.data?.error;
      setError(backendError || "Sampling request failed. Please try different values.");
    } finally {
      setLoading(false);
    }
  };

  const selectedTechniqueDetails = techniques.find((tech) => tech.key === selectedTechnique);

  return (
    <div>
      <Navbar />
      <div className="p-6 space-y-6">
        <Card title="Sampling Techniques">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Generate dataset samples using different statistical sampling methods and compare the result with the full dataset.
            </p>

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Technique</label>
                <select
                  className="w-full rounded border p-2"
                  value={selectedTechnique}
                  onChange={(e) => setSelectedTechnique(e.target.value)}
                >
                  {techniques.map((tech) => (
                    <option key={tech.key} value={tech.key}>
                      {tech.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Sample Size</label>
                <input
                  className="w-full rounded border p-2"
                  type="number"
                  min={1}
                  value={sampleSize}
                  onChange={(e) => setSampleSize(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Random Seed</label>
                <input
                  className="w-full rounded border p-2"
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                />
              </div>
            </div>

            {selectedTechniqueDetails?.description && (
              <p className="rounded bg-gray-50 p-2 text-sm text-gray-700">
                {selectedTechniqueDetails.description}
              </p>
            )}

            <button
              className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-60"
              onClick={runSampling}
              disabled={loading}
            >
              {loading ? "Generating Sample..." : "Generate Sample"}
            </button>

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          </div>
        </Card>

        {result && (
          <Card title="Sampling Result">
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Technique: <span className="font-semibold">{result.technique_label}</span> | Sample rows:{" "}
                <span className="font-semibold">{result.sample_size}</span> / {result.dataset_size}
              </p>

              {result.summary && (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded bg-emerald-50 p-3 text-sm">
                    <p className="font-semibold text-emerald-900">Dataset Emission Mean</p>
                    <p className="text-emerald-700">{result.summary.dataset_emission_mean}</p>
                  </div>
                  <div className="rounded bg-lime-50 p-3 text-sm">
                    <p className="font-semibold text-lime-900">Sample Emission Mean</p>
                    <p className="text-lime-700">{result.summary.sample_emission_mean}</p>
                  </div>
                  <div className="rounded bg-cyan-50 p-3 text-sm">
                    <p className="font-semibold text-cyan-900">Dataset Emission Std</p>
                    <p className="text-cyan-700">{result.summary.dataset_emission_std}</p>
                  </div>
                  <div className="rounded bg-sky-50 p-3 text-sm">
                    <p className="font-semibold text-sky-900">Sample Emission Std</p>
                    <p className="text-sky-700">{result.summary.sample_emission_std}</p>
                  </div>
                </div>
              )}

              {result.calculation?.steps?.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">Calculation Steps</p>
                  <div className="space-y-2 rounded border bg-gray-50 p-3 text-sm text-gray-700">
                    {result.calculation.steps.map((step) => (
                      <p key={step}>{step}</p>
                    ))}
                  </div>
                </div>
              )}

              {result.technique === "cluster" && result.calculation?.clusters?.length > 0 && (
                <div className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded bg-violet-50 p-3 text-sm">
                      <p className="font-semibold text-violet-900">Cluster Size</p>
                      <p className="text-violet-700">{result.calculation.cluster_size}</p>
                    </div>
                    <div className="rounded bg-fuchsia-50 p-3 text-sm">
                      <p className="font-semibold text-fuchsia-900">Selected Clusters</p>
                      <p className="text-fuchsia-700">{result.calculation.selected_clusters.join(", ")}</p>
                    </div>
                    <div className="rounded bg-rose-50 p-3 text-sm">
                      <p className="font-semibold text-rose-900">Rows Before Final Trim</p>
                      <p className="text-rose-700">{result.calculation.rows_collected_before_trim}</p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">Selected Cluster Details</p>
                    <div className="overflow-x-auto rounded border">
                      <table className="min-w-full border-collapse text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border px-3 py-2 text-left font-semibold">Cluster</th>
                            <th className="border px-3 py-2 text-left font-semibold">Row Range</th>
                            <th className="border px-3 py-2 text-left font-semibold">Cluster Population</th>
                            <th className="border px-3 py-2 text-left font-semibold">Calculation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.calculation.clusters.map((cluster) => (
                            <tr key={cluster.cluster_id} className="odd:bg-white even:bg-gray-50">
                              <td className="border px-3 py-2">{cluster.cluster_id}</td>
                              <td className="border px-3 py-2">
                                {cluster.row_start} to {cluster.row_end}
                              </td>
                              <td className="border px-3 py-2">{cluster.cluster_population}</td>
                              <td className="border px-3 py-2">
                                Cluster {cluster.cluster_id} covers rows {cluster.row_start} to {cluster.row_end}
                                and contributes {cluster.cluster_population} rows.
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {result.technique === "stratified" && result.calculation?.strata?.length > 0 && (
                <div className="space-y-3">
                  <div className="rounded bg-amber-50 p-3 text-sm text-amber-900">
                    <p className="font-semibold">Strata Created</p>
                    <p>
                      Column used for stratification: {result.calculation.strata_column}. Total strata:{" "}
                      {result.calculation.strata.length}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">Strata Allocation</p>
                    <div className="overflow-x-auto rounded border">
                      <table className="min-w-full border-collapse text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border px-3 py-2 text-left font-semibold">Stratum</th>
                            <th className="border px-3 py-2 text-left font-semibold">Population Size</th>
                            <th className="border px-3 py-2 text-left font-semibold">Exact Allocation</th>
                            <th className="border px-3 py-2 text-left font-semibold">Allocated Sample</th>
                            <th className="border px-3 py-2 text-left font-semibold">Calculation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.calculation.strata.map((stratum) => (
                            <tr key={String(stratum.stratum)} className="odd:bg-white even:bg-gray-50">
                              <td className="border px-3 py-2">{formatValue(stratum.stratum)}</td>
                              <td className="border px-3 py-2">{formatValue(stratum.population_size)}</td>
                              <td className="border px-3 py-2">{formatValue(stratum.exact_allocation)}</td>
                              <td className="border px-3 py-2">{formatValue(stratum.allocated_sample_size)}</td>
                              <td className="border px-3 py-2">{stratum.calculation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Preview (first {result.preview_limit} rows)</p>
                <div className="overflow-x-auto rounded border">
                  <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        {result.columns.map((column) => (
                          <th key={column} className="border px-3 py-2 text-left font-semibold">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.preview_rows.map((row, index) => (
                        <tr key={`row-${index}`} className="odd:bg-white even:bg-gray-50">
                          {result.columns.map((column) => (
                            <td key={`${index}-${column}`} className="border px-3 py-2">
                              {row[column] ?? "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card title="Available Methods">
          <div className="grid gap-3 md:grid-cols-2">
            {techniques.map((tech) => (
              <div key={tech.key} className="rounded border p-3">
                <p className="font-semibold text-gray-800">{tech.label}</p>
                <p className="text-sm text-gray-600">{tech.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Sampling;
