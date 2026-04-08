from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd

from graph_utils import generate_all_graphs, get_mlr_details
from model_utils import (
    calculate_percentile,
    get_feature_ranges,
    normalize_and_clip_input,
    train_prediction_model,
)
from hypothesis_tests import run_t_test, run_z_test
from sampling import generate_sample, get_sampling_techniques

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


@app.route("/mlr-info", methods=["GET"])
def mlr_info():
    try:
        return jsonify(get_mlr_details(df))
    except Exception as error:  # noqa: BLE001
        return jsonify({"error": f"MLR info failed: {error}"}), 500


@app.route("/sampling-techniques", methods=["GET"])
def sampling_techniques():
    return jsonify({"techniques": get_sampling_techniques()})


@app.route("/sampling", methods=["POST"])
def sampling():
    try:
        data = request.json or {}
        technique = data.get("technique", "random")
        sample_size = data.get("sample_size", 50)
        random_seed = data.get("random_seed", 42)
        strata_column = data.get("strata_column", "food_encoded")
        preview_limit = data.get("preview_limit", 15)

        result = generate_sample(
            technique=technique,
            sample_size=sample_size,
            seed=random_seed,
            strata_column=strata_column,
            preview_limit=preview_limit,
        )
        return jsonify(result)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except Exception as error:  # noqa: BLE001
        return jsonify({"error": f"Sampling failed: {error}"}), 500


@app.route("/t-test", methods=["GET"])
def t_test():
    try:
        return jsonify(run_t_test())
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except Exception as error:  # noqa: BLE001
        return jsonify({"error": f"T-test failed: {error}"}), 500


@app.route("/z-test", methods=["GET"])
def z_test():
    try:
        sample_size = request.args.get("sample_size", default=1000, type=int)
        random_seed = request.args.get("random_seed", default=42, type=int)
        return jsonify(run_z_test(sample_size=sample_size, random_seed=random_seed))
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except Exception as error:  # noqa: BLE001
        return jsonify({"error": f"Z-test failed: {error}"}), 500


if __name__ == "__main__":
    app.run(debug=True)
