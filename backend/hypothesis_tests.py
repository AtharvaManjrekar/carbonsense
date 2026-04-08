from pathlib import Path

import numpy as np
import pandas as pd
from scipy.stats import norm, ttest_ind


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "final_cleaned_dataset.csv"


def load_dataset():
    return pd.read_csv(DATASET_PATH)


def run_t_test():
    df = load_dataset()
    group_veg = df[df["food_encoded"] == 0]["emission"].dropna()
    group_non_veg = df[df["food_encoded"] == 1]["emission"].dropna()

    if len(group_veg) < 2 or len(group_non_veg) < 2:
        raise ValueError("Not enough data in one of the groups for T-test.")

    t_stat, p_value = ttest_ind(group_veg, group_non_veg, equal_var=False)
    significant = bool(p_value < 0.05)

    return {
        "test_name": "Two-sample Welch T-test",
        "group_a": {"name": "Veg (food_encoded = 0)", "size": int(len(group_veg)), "mean": round(float(group_veg.mean()), 4)},
        "group_b": {
            "name": "Non-Veg (food_encoded = 1)",
            "size": int(len(group_non_veg)),
            "mean": round(float(group_non_veg.mean()), 4),
        },
        "t_statistic": round(float(t_stat), 6),
        "p_value": round(float(p_value), 6),
        "alpha": 0.05,
        "significant": significant,
        "interpretation": (
            "Difference is statistically significant at 5% level."
            if significant
            else "Difference is not statistically significant at 5% level."
        ),
    }


def run_z_test(sample_size=1000, random_seed=42):
    df = load_dataset()
    emission = df["emission"].dropna()

    if len(emission) < 2:
        raise ValueError("Not enough emission data for Z-test.")

    sample_size = int(sample_size)
    if sample_size < 2:
        raise ValueError("Sample size must be at least 2.")
    if sample_size > len(emission):
        sample_size = len(emission)

    sample = emission.sample(n=sample_size, random_state=int(random_seed))
    sample_mean = float(sample.mean())
    population_mean = float(emission.mean())
    sample_std = float(sample.std(ddof=1))

    z_value = (sample_mean - population_mean) / (sample_std / np.sqrt(sample_size))
    p_value_two_tailed = 2 * (1 - norm.cdf(abs(z_value)))
    significant = bool(p_value_two_tailed < 0.05)

    return {
        "test_name": "One-sample Z-test",
        "sample_size": int(sample_size),
        "population_size": int(len(emission)),
        "sample_mean": round(sample_mean, 6),
        "population_mean": round(population_mean, 6),
        "sample_std": round(sample_std, 6),
        "z_value": round(float(z_value), 6),
        "p_value_two_tailed": round(float(p_value_two_tailed), 6),
        "alpha": 0.05,
        "significant": significant,
        "interpretation": (
            "Sample mean differs significantly from population mean at 5% level."
            if significant
            else "No significant difference between sample and population mean at 5% level."
        ),
    }
