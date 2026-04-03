import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import axios from "axios";

function Predict() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    travel: "",
    electricity: "",
    food_encoded: "",
    screen_time: "",
    waste: ""
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const predict = async () => {
    try {
      setError("");
      const res = await axios.post("http://localhost:5000/predict", data);
      const predictionResponse = res.data;
      const emission = Number(predictionResponse.emission);

      setResult(emission);
      localStorage.setItem(
        "latestPrediction",
        JSON.stringify({
          ...predictionResponse,
          inputs: data,
          predictedAt: new Date().toISOString(),
        })
      );
      navigate("/visualization");
    } catch (error) {
      console.error("Error:", error);
      setError("Prediction failed. Please check that the backend is running on port 5000.");
    }
  };

  return (
    <div>
      <Navbar />

      <div className="p-6 max-w-md mx-auto">
        <Card title="Predict Carbon Emission">
          <p className="mb-4 text-sm text-gray-600">
            Best results come from values near the training data ranges:
            Travel `0-9999`, Electricity `2-12.27`, Food `0-1`, Screen Time `0-24`, Waste `0.1-7`.
          </p>

          <input
            className="border p-2 w-full mb-2"
            name="travel"
            placeholder="Travel (km)"
            onChange={handleChange}
          />

          <input
            className="border p-2 w-full mb-2"
            name="electricity"
            placeholder="Electricity"
            onChange={handleChange}
          />

          <input
            className="border p-2 w-full mb-2"
            name="food_encoded"
            placeholder="Food (0 = Veg, 1 = Non-Veg)"
            onChange={handleChange}
          />

          <input
            className="border p-2 w-full mb-2"
            name="screen_time"
            placeholder="Screen Time"
            onChange={handleChange}
          />

          <input
            className="border p-2 w-full mb-2"
            name="waste"
            placeholder="Waste"
            onChange={handleChange}
          />

          <button
            className="bg-green-600 text-white p-2 w-full"
            onClick={predict}
          >
            Predict
          </button>

          {error && (
            <p className="mt-3 text-red-600 font-medium">{error}</p>
          )}

          {result !== null && (
            <p className="mt-3 font-semibold">
              Predicted Emission: {result.toFixed(2)}
            </p>
          )}

        </Card>
      </div>
    </div>
  );
}

export default Predict;
