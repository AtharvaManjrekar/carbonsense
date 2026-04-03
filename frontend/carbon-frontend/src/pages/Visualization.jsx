import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import ChartBox from "../components/ChartBox";
import Card from "../components/Card";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatFeatureLabel(key) {
  const labels = {
    travel_km: "Travel",
    electricity: "Electricity",
    food_encoded: "Food",
    screen_time: "Screen Time",
    waste: "Waste",
  };

  return labels[key] ?? key;
}

function getEmissionStatus(prediction) {
  const percentile = Number(prediction.emission_percentile ?? 0);
  const emission = Number(prediction.emission ?? 0);
  const average = Number(prediction.dataset_average_emission ?? 0);
  const hasWarnings = Boolean(prediction.warnings?.length);

  if (!hasWarnings && percentile <= 20 && emission <= average * 0.45) {
    return {
      label: "Low",
      tone: "text-green-700",
      summary: `This prediction is lower than most records in the dataset and sits well below the average of ${average.toFixed(2)}.`,
    };
  }

  if (percentile <= 65 || emission <= average * 0.9) {
    return {
      label: "Moderate",
      tone: "text-amber-700",
      summary: `This prediction is below or around the dataset average of ${average.toFixed(2)}, but it is not low enough to be treated as a clearly low-emission case.`,
    };
  }

  return {
    label: "High",
    tone: "text-red-700",
    summary: `This prediction is higher than a large share of the dataset and is above the average level of ${average.toFixed(2)}.`,
  };
}

function getPersonalizedTips(inputs) {
  const tips = [];
  const travel = Number(inputs.travel);
  const electricity = Number(inputs.electricity);
  const food = Number(inputs.food_encoded);
  const screenTime = Number(inputs.screen_time);
  const waste = Number(inputs.waste);

  if (travel > 40) {
    tips.push("Travel is contributing a lot. Try combining trips, carpooling, or using public transport for shorter routes.");
  }

  if (electricity > 250) {
    tips.push("Electricity usage is fairly high. Switching off idle devices and using efficient appliances can reduce this quickly.");
  }

  if (food === 1) {
    tips.push("Your food pattern suggests a higher-footprint diet. Adding a few more plant-based meals each week can lower emissions.");
  }

  if (screenTime > 8) {
    tips.push("Long screen time usually means more electricity consumption. Reducing device time a little each day can help.");
  }

  if (waste > 5) {
    tips.push("Waste generation looks elevated. Separating recyclable waste and avoiding single-use items can make a visible difference.");
  }

  if (tips.length === 0) {
    tips.push("Your current habits already look balanced. Focus on maintaining efficient energy use and low daily waste.");
  }

  return tips;
}

function Visualization() {
  const [prediction, setPrediction] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [graphStatus, setGraphStatus] = useState("");
  const [isRefreshingGraphs, setIsRefreshingGraphs] = useState(false);

  useEffect(() => {
    const savedPrediction = localStorage.getItem("latestPrediction");

    if (savedPrediction) {
      setPrediction(JSON.parse(savedPrediction));
    }

    const loadModelInfo = async () => {
      try {
        const res = await axios.get("http://localhost:5000/model-info");
        setModelInfo(res.data);
      } catch (error) {
        console.error("Could not load model info:", error);
      }
    };

    loadModelInfo();
  }, []);

  const emission = prediction ? Number(prediction.emission) : null;
  const status = prediction ? getEmissionStatus(prediction) : null;
  const tips = prediction ? getPersonalizedTips(prediction.inputs) : [];
  const emissionAverage = prediction
    ? Number(prediction.dataset_average_emission ?? modelInfo?.dataset_average_emission ?? 0)
    : 0;
  const emissionChartMax = Math.max(emission ?? 0, emissionAverage, 1);
  const userFeatureBars =
    prediction && modelInfo?.feature_ranges
      ? Object.entries(modelInfo.feature_ranges).map(([feature, range]) => {
          const adjustedValue = Number(prediction.adjusted_inputs?.[feature] ?? 0);
          const max = Number(range.max || 1);

          return {
            feature,
            adjustedValue,
            max,
            width: Math.min((adjustedValue / max) * 100, 100),
          };
        })
      : [];

  const regenerateGraphs = async () => {
    try {
      setIsRefreshingGraphs(true);
      setGraphStatus("");
      await axios.post("http://localhost:5000/regenerate-graphs");
      setGraphStatus("Graphs regenerated from the latest dataset. Refresh the page if a chart image was cached.");
    } catch (error) {
      console.error("Graph regeneration failed:", error);
      setGraphStatus("Could not regenerate graphs. Please make sure the backend is running.");
    } finally {
      setIsRefreshingGraphs(false);
    }
  };

  const downloadPersonalizedReport = () => {
    if (!prediction || !status) {
      return;
    }

    const warningHtml = prediction.warnings?.length
      ? `
        <div class="warning-box">
          <h3>Range Warning</h3>
          ${prediction.warnings.map((warning) => `<p>${escapeHtml(warning)}</p>`).join("")}
        </div>
      `
      : "";

    const featureBarsHtml = userFeatureBars
      .map(
        (bar) => `
          <div class="feature-row">
            <div class="feature-label">
              <span>${escapeHtml(formatFeatureLabel(bar.feature))}</span>
              <span>${bar.adjustedValue.toFixed(2)} / ${bar.max.toFixed(2)}</span>
            </div>
            <div class="track">
              <div class="fill secondary" style="width: ${bar.width}%"></div>
            </div>
          </div>
        `
      )
      .join("");

    const tipsHtml = tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("");

    const reportHtml = `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>CarbonSense Personalized Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; background: #f4f8f4; color: #1f2937; }
            .page { max-width: 900px; margin: 0 auto; padding: 32px; }
            .hero, .card { background: #ffffff; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); margin-bottom: 20px; }
            .hero { background: linear-gradient(135deg, #14532d, #16a34a); color: white; }
            h1, h2, h3, p { margin-top: 0; }
            .meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
            .metric { background: rgba(255, 255, 255, 0.14); border-radius: 12px; padding: 12px; }
            .track { height: 16px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
            .fill { height: 100%; background: #16a34a; border-radius: 999px; }
            .fill.secondary { background: #0f766e; }
            .bar-block { margin-bottom: 16px; }
            .bar-label, .feature-label { display: flex; justify-content: space-between; gap: 16px; font-size: 14px; margin-bottom: 6px; }
            .feature-row { margin-bottom: 14px; }
            ul { padding-left: 20px; margin-bottom: 0; }
            .warning-box { background: #fffbeb; border: 1px solid #f59e0b; color: #92400e; border-radius: 12px; padding: 16px; margin-top: 16px; }
          </style>
        </head>
        <body>
          <div class="page">
            <section class="hero">
              <h1>CarbonSense Personalized Report</h1>
              <p>Generated on ${escapeHtml(new Date().toLocaleString())}</p>
              <div class="meta">
                <div class="metric"><strong>Predicted Emission</strong><p>${emission.toFixed(2)}</p></div>
                <div class="metric"><strong>Status</strong><p>${escapeHtml(status.label)}</p></div>
                <div class="metric"><strong>Dataset Average</strong><p>${emissionAverage.toFixed(2)}</p></div>
                <div class="metric"><strong>Percentile</strong><p>${escapeHtml(prediction.emission_percentile)}%</p></div>
              </div>
            </section>
            <section class="card">
              <h2>Prediction Summary</h2>
              <p>${escapeHtml(status.summary)}</p>
              <p>
                Inputs: Travel ${escapeHtml(prediction.inputs.travel)}, Electricity ${escapeHtml(prediction.inputs.electricity)},
                Food ${escapeHtml(prediction.inputs.food_encoded)}, Screen Time ${escapeHtml(prediction.inputs.screen_time)},
                Waste ${escapeHtml(prediction.inputs.waste)}
              </p>
              ${warningHtml}
            </section>
            <section class="card">
              <h2>Personalized Graphs</h2>
              <div class="bar-block">
                <div class="bar-label"><span>Your predicted emission</span><span>${emission.toFixed(2)}</span></div>
                <div class="track"><div class="fill" style="width: ${(emission / emissionChartMax) * 100}%"></div></div>
              </div>
              <div class="bar-block">
                <div class="bar-label"><span>Dataset average emission</span><span>${emissionAverage.toFixed(2)}</span></div>
                <div class="track"><div class="fill secondary" style="width: ${(emissionAverage / emissionChartMax) * 100}%"></div></div>
              </div>
              <h3>Adjusted Inputs vs Training Range</h3>
              ${featureBarsHtml}
            </section>
            <section class="card">
              <h2>Tips For Improvement</h2>
              <ul>${tipsHtml}</ul>
            </section>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([reportHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carbonsense-report-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 space-y-6">
        <Card title="Graph Generation">
          <div className="space-y-3">
            <p className="text-gray-700">
              These graphs are dataset-based analytics. They are not generated again for every single prediction.
              Your prediction result is dynamic, but the charts are created from the stored dataset until you regenerate them.
            </p>
            <button
              className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
              onClick={regenerateGraphs}
              disabled={isRefreshingGraphs}
            >
              {isRefreshingGraphs ? "Regenerating..." : "Regenerate Dataset Graphs"}
            </button>
            {graphStatus && <p className="text-sm text-gray-600">{graphStatus}</p>}
          </div>
        </Card>

        <Card title="Latest Prediction">
          {prediction ? (
            <div className="space-y-2">
              <p className="text-lg font-semibold text-green-700">
                Predicted Emission: {emission.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">
                Travel: {prediction.inputs.travel}, Electricity: {prediction.inputs.electricity},
                Food: {prediction.inputs.food_encoded}, Screen Time: {prediction.inputs.screen_time},
                Waste: {prediction.inputs.waste}
              </p>
              {prediction.model && (
                <p className="text-sm text-gray-600">
                  Model: {prediction.model} | Dataset percentile: {prediction.emission_percentile}%
                </p>
              )}
              <button
                className="mt-3 rounded-lg bg-green-700 px-4 py-2 text-white"
                onClick={downloadPersonalizedReport}
              >
                Download Personalized Report
              </button>
            </div>
          ) : (
            <p className="text-gray-600">
              No prediction has been generated yet. Go to the Predict page and submit values.
            </p>
          )}
        </Card>

        {prediction && (
          <Card title="Prediction Analysis">
            <div className="space-y-3">
              <p className={`text-lg font-semibold ${status.tone}`}>
                Status: {status.label}
              </p>
              <p className="text-gray-700">{status.summary}</p>
              <p className="text-sm text-gray-600">
                This assessment is based on the model output, the dataset average, and the prediction percentile.
              </p>
              {prediction.warnings?.length > 0 && (
                <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  <p className="font-semibold mb-1">Range warning</p>
                  {prediction.warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                  <p className="mt-2">
                    Inputs outside the training data are capped to the nearest known value, so this result is less reliable than an in-range prediction.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {prediction && (
          <Card title="Your Prediction Graph">
            <div className="space-y-6">
              <div>
                <p className="mb-3 text-sm text-gray-600">
                  This graph is generated from the current user prediction, so it changes every time new values are submitted.
                </p>
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-sm font-medium text-gray-700">
                      <span>Your predicted emission</span>
                      <span>{emission.toFixed(2)}</span>
                    </div>
                    <div className="h-4 rounded-full bg-green-100">
                      <div
                        className="h-4 rounded-full bg-green-600"
                        style={{ width: `${(emission / emissionChartMax) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between text-sm font-medium text-gray-700">
                      <span>Dataset average emission</span>
                      <span>{emissionAverage.toFixed(2)}</span>
                    </div>
                    <div className="h-4 rounded-full bg-slate-200">
                      <div
                        className="h-4 rounded-full bg-slate-700"
                        style={{ width: `${(emissionAverage / emissionChartMax) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {userFeatureBars.length > 0 && (
                <div>
                  <p className="mb-3 text-sm text-gray-600">
                    Adjusted user inputs as a share of the model training range.
                  </p>
                  <div className="space-y-3">
                    {userFeatureBars.map((bar) => (
                      <div key={bar.feature}>
                        <div className="mb-1 flex justify-between text-sm text-gray-700">
                          <span>{formatFeatureLabel(bar.feature)}</span>
                          <span>
                            {bar.adjustedValue.toFixed(2)} / {bar.max.toFixed(2)}
                          </span>
                        </div>
                        <div className="h-3 rounded-full bg-emerald-100">
                          <div
                            className="h-3 rounded-full bg-emerald-600"
                            style={{ width: `${bar.width}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {prediction && (
          <Card title="Personalized Tips">
            <div className="space-y-2 text-gray-700">
              {tips.map((tip) => (
                <p key={tip}>• {tip}</p>
              ))}
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <ChartBox title="Emission Distribution" img="/histogram.png" />
          <ChartBox title="Travel vs Emission" img="/scatter.png" />
          <ChartBox title="Correlation Heatmap" img="/heatmap.png" />
        </div>
      </div>
    </div>
  );
}

export default Visualization;
