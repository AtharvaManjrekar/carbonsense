from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd

from graph_utils import generate_all_graphs
from model_utils import (
    calculate_percentile,
    get_feature_ranges,
    normalize_and_clip_input,
    train_prediction_model,
)

app = Flask(__name__)
CORS(app)   # ✅ IMPORTANT LINE

# Load dataset
df, model = train_prediction_model()
feature_ranges = get_feature_ranges(df)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    original_inputs, adjusted_inputs, warnings = normalize_and_clip_input(data, feature_ranges)
    input_frame = pd.DataFrame([adjusted_inputs])
    prediction = float(model.predict(input_frame)[0])
    percentile = calculate_percentile(df, prediction)

    return jsonify(
        {
            "emission": round(prediction, 2),
            "model": "GradientBoostingRegressor",
            "dataset_average_emission": round(float(df["emission"].mean()), 2),
            "emission_percentile": percentile,
            "original_inputs": original_inputs,
            "adjusted_inputs": adjusted_inputs,
            "warnings": warnings,
        }
    )


@app.route("/regenerate-graphs", methods=["POST"])
def regenerate_graphs():
    metrics = generate_all_graphs()
    return jsonify(
        {
            "message": "Graphs regenerated from the current dataset.",
            "generated_from": "dataset",
            "prediction_triggered": False,
            "metrics": metrics,
        }
    )


@app.route("/model-info", methods=["GET"])
def model_info():
    return jsonify(
        {
            "model": "GradientBoostingRegressor",
            "feature_ranges": feature_ranges,
            "dataset_average_emission": round(float(df["emission"].mean()), 2),
            "dataset_rows": int(len(df)),
        }
    )

if __name__ == "__main__":
    app.run(debug=True)
