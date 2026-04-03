from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from scipy.stats import expon, norm, poisson
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "final_cleaned_dataset.csv"
FRONTEND_PUBLIC_DIR = BASE_DIR.parent / "frontend" / "carbon-frontend" / "public"


def load_dataset():
    return pd.read_csv(DATASET_PATH)


def save_plot(filename):
    FRONTEND_PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    plt.tight_layout()
    plt.savefig(FRONTEND_PUBLIC_DIR / filename)
    plt.close()


def generate_visualization_graphs(df):
    plt.figure()
    sns.histplot(df["emission"], bins=30, kde=True)
    plt.title("Emission Distribution")
    save_plot("histogram.png")

    plt.figure()
    sns.scatterplot(x=df["travel_km"], y=df["emission"])
    plt.title("Travel vs Emission")
    save_plot("scatter.png")

    plt.figure()
    sns.scatterplot(x=df["electricity"], y=df["emission"])
    plt.title("Electricity vs Emission")
    save_plot("electricity.png")

    plt.figure(figsize=(8, 6))
    sns.heatmap(df.corr(numeric_only=True), annot=True, cmap="coolwarm")
    plt.title("Correlation Heatmap")
    save_plot("heatmap.png")


def generate_correlation_graphs(df):
    corr = df.corr(numeric_only=True)

    plt.figure(figsize=(8, 6))
    sns.heatmap(corr, annot=True, cmap="coolwarm")
    plt.title("Correlation Matrix")
    save_plot("correlation_matrix.png")

    x = df[["travel_km"]]
    y = df["emission"]
    model = LinearRegression()
    model.fit(x, y)

    plt.figure()
    sns.scatterplot(x=df["travel_km"], y=df["emission"])
    plt.plot(df["travel_km"], model.predict(x), color="red")
    plt.title("Simple Linear Regression (Travel vs Emission)")
    save_plot("slr.png")


def generate_mlr_graphs(df):
    x = df[["travel_km", "electricity", "food_encoded", "screen_time", "waste"]]
    y = df["emission"]

    model = LinearRegression()
    model.fit(x, y)
    y_pred = model.predict(x)

    plt.figure(figsize=(8, 6))
    plt.scatter(y, y_pred, alpha=0.3)
    plt.xlabel("Actual Emission")
    plt.ylabel("Predicted Emission")
    plt.title("MLR (Full Dataset - Population)")
    save_plot("mlr_full.png")

    sample_size = min(1000, len(df))
    sample_df = df.sample(sample_size, random_state=42)
    x_sample = sample_df[x.columns]
    y_sample = sample_df["emission"]
    y_pred_sample = model.predict(x_sample)

    plt.figure(figsize=(8, 6))
    plt.scatter(y_sample, y_pred_sample, alpha=0.5)
    plt.plot(
        [y_sample.min(), y_sample.max()],
        [y_sample.min(), y_sample.max()],
        color="red",
        linestyle="--",
    )
    plt.xlabel("Actual Emission")
    plt.ylabel("Predicted Emission")
    plt.title(f"MLR (Sampled Data - {sample_size} rows)")
    save_plot("mlr_sample.png")

    return {"r2_score": round(r2_score(y, y_pred), 4)}


def generate_mle_graphs(df):
    data = df["emission"].dropna()
    mu = np.mean(data)
    sigma = np.std(data)

    x = np.linspace(min(data), max(data), 200)
    pdf = norm.pdf(x, mu, sigma)

    plt.figure()
    plt.hist(data, bins=30, density=True, alpha=0.65, color="#93c5fd")
    plt.plot(x, pdf, color="#1d4ed8", linewidth=2)
    plt.title("Normal Distribution (MLE)")
    save_plot("mle_normal.png")

    # Poisson is for count data, so use rounded emissions as an approximation.
    count_data = np.clip(np.rint(data).astype(int), 0, None)
    lam = float(np.mean(count_data))
    spread = max(10, int(np.ceil(4 * np.sqrt(max(lam, 1)))))
    start = max(0, int(np.floor(lam - spread)))
    end = int(np.ceil(lam + spread))
    x_p = np.arange(start, end + 1)

    plt.figure()
    bins = np.arange(start - 0.5, end + 1.5, 1)
    plt.hist(
        count_data,
        bins=bins,
        density=True,
        alpha=0.55,
        color="#bbf7d0",
        label="Rounded emission counts",
    )
    plt.plot(
        x_p,
        poisson.pmf(x_p, lam),
        marker="o",
        color="#15803d",
        linewidth=2,
        label=f"Poisson PMF (lambda={lam:.2f})",
    )
    plt.title("Poisson Distribution (Approximation)")
    plt.xlabel("Rounded emission value")
    plt.ylabel("Probability")
    plt.legend()
    save_plot("mle_poisson.png")

    lambda_exp = 1 / np.mean(data)
    x_e = np.linspace(0, max(data), 200)

    plt.figure()
    plt.plot(x_e, expon.pdf(x_e, scale=1 / lambda_exp), color="#b45309", linewidth=2)
    plt.title("Exponential Distribution")
    plt.xlabel("Emission")
    plt.ylabel("Density")
    save_plot("mle_exponential.png")

    return {
        "normal_mean": round(float(mu), 2),
        "normal_std": round(float(sigma), 2),
        "poisson_lambda": round(lam, 2),
    }


def generate_all_graphs():
    df = load_dataset()
    generate_visualization_graphs(df)
    generate_correlation_graphs(df)
    mlr_metrics = generate_mlr_graphs(df)
    mle_metrics = generate_mle_graphs(df)

    return {
        "dataset_rows": int(len(df)),
        "mlr": mlr_metrics,
        "mle": mle_metrics,
    }
