from pathlib import Path

import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "final_cleaned_dataset.csv"
FEATURE_COLUMNS = ["travel_km", "electricity", "food_encoded", "screen_time", "waste"]
INPUT_TO_FEATURE = {
    "travel": "travel_km",
    "electricity": "electricity",
    "food_encoded": "food_encoded",
    "screen_time": "screen_time",
    "waste": "waste",
}


def load_training_data():
    df = pd.read_csv(DATASET_PATH)
    x = df[FEATURE_COLUMNS]
    y = df["emission"]
    return df, x, y


def train_prediction_model():
    df, x, y = load_training_data()
    model = GradientBoostingRegressor(random_state=42)
    model.fit(x, y)
    return df, model


def get_feature_ranges(df):
    ranges = {}
    for feature in FEATURE_COLUMNS:
        ranges[feature] = {
            "min": float(df[feature].min()),
            "max": float(df[feature].max()),
            "median": float(df[feature].median()),
        }
    return ranges


def normalize_and_clip_input(raw_data, feature_ranges):
    original_inputs = {}
    adjusted_inputs = {}
    warnings = []

    for input_name, feature_name in INPUT_TO_FEATURE.items():
        raw_value = float(raw_data[input_name])
        feature_range = feature_ranges[feature_name]
        adjusted_value = min(max(raw_value, feature_range["min"]), feature_range["max"])

        original_inputs[input_name] = raw_value
        adjusted_inputs[feature_name] = adjusted_value

        if adjusted_value != raw_value:
            warnings.append(
                f"{input_name} was outside the training range and was adjusted from "
                f"{raw_value:g} to {adjusted_value:g}."
            )

    return original_inputs, adjusted_inputs, warnings


def calculate_percentile(df, emission_value):
    percentile = (df["emission"] <= emission_value).mean() * 100
    return round(float(percentile), 2)
