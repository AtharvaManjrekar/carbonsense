import Navbar from "../components/Navbar";
import Card from "../components/Card";
import { useEffect, useState } from "react";
import axios from "axios";

function MLR() {
  const [mlrInfo, setMlrInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMlrInfo = async () => {
      try {
        const res = await axios.get("http://localhost:5000/mlr-info");
        setMlrInfo(res.data);
      } catch (loadError) {
        console.error("Failed to load MLR info:", loadError);
        setError("Could not load MLR coefficients. Please make sure backend is running.");
      }
    };

    loadMlrInfo();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="p-6 space-y-6">
        <Card title="Multiple Linear Regression">
          <div className="space-y-3">
            <p className="text-gray-700">
              The MLR model estimates emission by combining travel, electricity use,
              food habits, screen time, and waste into one prediction.
            </p>
            <p className="font-semibold text-green-700">
              Emission = b0 + b1(Travel) + b2(Electricity) + b3(Food) + b4(Screen Time) + b5(Waste)
            </p>
            {mlrInfo?.equation && (
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-sm font-semibold text-emerald-900">Calculated Equation</p>
                <p className="mt-1 font-medium text-emerald-700">{mlrInfo.equation}</p>
              </div>
            )}
            <p className="text-sm text-gray-600">
              This helps us understand how multiple lifestyle factors together affect carbon output.
            </p>
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          </div>
        </Card>

        {mlrInfo && (
          <Card title="Coefficient Values">
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded bg-slate-50 p-3 text-sm">
                  <p className="font-semibold text-slate-800">Intercept (b0)</p>
                  <p className="text-slate-700">{mlrInfo.intercept}</p>
                </div>
                <div className="rounded bg-emerald-50 p-3 text-sm">
                  <p className="font-semibold text-emerald-900">R2 Score</p>
                  <p className="text-emerald-700">{mlrInfo.r2_score}</p>
                </div>
                <div className="rounded bg-cyan-50 p-3 text-sm">
                  <p className="font-semibold text-cyan-900">Dataset Rows</p>
                  <p className="text-cyan-700">{mlrInfo.dataset_rows}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded border">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-3 py-2 text-left font-semibold">Term</th>
                      <th className="border px-3 py-2 text-left font-semibold">Feature</th>
                      <th className="border px-3 py-2 text-left font-semibold">Coefficient</th>
                      <th className="border px-3 py-2 text-left font-semibold">Numerical Form</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="border px-3 py-2 font-medium">b0</td>
                      <td className="border px-3 py-2">Intercept</td>
                      <td className="border px-3 py-2">{mlrInfo.intercept}</td>
                      <td className="border px-3 py-2">{mlrInfo.intercept}</td>
                    </tr>
                    {mlrInfo.coefficients?.map((item, index) => (
                      <tr key={item.feature} className="odd:bg-white even:bg-gray-50">
                        <td className="border px-3 py-2 font-medium">b{index + 1}</td>
                        <td className="border px-3 py-2">{item.label}</td>
                        <td className="border px-3 py-2">{item.coefficient}</td>
                        <td className="border px-3 py-2">
                          {item.coefficient} x {item.label}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card title="MLR Fit On Full Dataset">
            <img src="/mlr_full.png" alt="MLR full dataset graph" className="w-full rounded-lg mb-3" />
            <p className="text-sm text-gray-700">
              This graph shows how well the regression model follows the full set of observed emissions.
              A closer match means the model is learning the trend in the data well.
            </p>
          </Card>

          <Card title="MLR Sample Prediction">
            <img src="/mlr_sample.png" alt="MLR sample prediction graph" className="w-full rounded-lg mb-3" />
            <p className="text-sm text-gray-700">
              This sample plot highlights predicted values for example inputs and helps compare the model output
              against expected emission behavior.
            </p>
          </Card>
        </div>

        <Card title="How To Read These Graphs">
          <p className="text-gray-700">
            If predicted points stay close to actual trends, the model is performing reasonably well.
            Large gaps can suggest missing features, noisy data, or a need for better model tuning.
          </p>
        </Card>
      </div>
    </div>
  );
}

export default MLR;
