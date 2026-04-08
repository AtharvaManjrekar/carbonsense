from pathlib import Path

import numpy as np
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "final_cleaned_dataset.csv"


TECHNIQUE_DEFINITIONS = {
    "random": {
        "label": "Simple Random Sampling",
        "description": "Selects rows uniformly at random from the full dataset.",
    },
    "systematic": {
        "label": "Systematic Sampling",
        "description": "Selects every k-th row after a random starting point.",
    },
    "stratified": {
        "label": "Stratified Sampling",
        "description": "Samples proportionally from each category of a stratification column.",
    },
    "cluster": {
        "label": "Cluster Sampling",
        "description": "Chooses random clusters of contiguous rows and samples from those clusters.",
    },
}


def load_dataset():
    return pd.read_csv(DATASET_PATH)


def get_sampling_techniques():
    return [
        {"key": key, "label": value["label"], "description": value["description"]}
        for key, value in TECHNIQUE_DEFINITIONS.items()
    ]


def _sanitize_sample_size(sample_size, row_count):
    sample_size = int(sample_size)
    if sample_size < 1:
        raise ValueError("Sample size must be at least 1.")
    if sample_size > row_count:
        raise ValueError(f"Sample size cannot exceed dataset size ({row_count}).")
    return sample_size


def _as_python_records(df):
    safe_df = df.where(pd.notna(df), None)
    return safe_df.to_dict(orient="records")


def _round_float(value, digits=4):
    return round(float(value), digits)


def random_sampling(df, sample_size, seed):
    sampled_df = df.sample(n=sample_size, random_state=seed).reset_index(drop=True)
    return sampled_df, {
        "steps": [
            f"Selected {sample_size} rows directly at random from {len(df)} total rows.",
        ]
    }


def systematic_sampling(df, sample_size, seed):
    if sample_size >= len(df):
        sampled_df = df.copy().reset_index(drop=True)
        return sampled_df, {
            "interval": 1,
            "start": 0,
            "selected_indices": list(range(len(df))),
            "steps": [
                "Sample size is at least the dataset size, so all rows were selected.",
            ],
        }

    rng = np.random.default_rng(seed)
    interval = len(df) / sample_size
    start = rng.uniform(0, interval)

    indices = [int(np.floor(start + i * interval)) for i in range(sample_size)]
    unique_indices = list(dict.fromkeys(min(index, len(df) - 1) for index in indices))

    if len(unique_indices) < sample_size:
        remaining = [i for i in range(len(df)) if i not in set(unique_indices)]
        fill_count = sample_size - len(unique_indices)
        fill_indices = rng.choice(remaining, size=fill_count, replace=False).tolist()
        unique_indices.extend(fill_indices)

    selected_indices = sorted(unique_indices[:sample_size])
    sampled_df = df.iloc[selected_indices].reset_index(drop=True)
    return sampled_df, {
        "interval": _round_float(interval),
        "start": _round_float(start),
        "selected_indices": selected_indices,
        "steps": [
            f"Sampling interval k = dataset_size / sample_size = {len(df)} / {sample_size} = {_round_float(interval)}.",
            f"Random start selected using seed {seed}: {_round_float(start)}.",
            "Rows were chosen near positions start + i * k and then deduplicated if needed.",
        ],
    }


def stratified_sampling(df, sample_size, seed, strata_column="food_encoded"):
    if strata_column not in df.columns:
        raise ValueError(f"Strata column '{strata_column}' does not exist in the dataset.")

    grouped = df.groupby(strata_column, sort=False)
    group_sizes = grouped.size()
    total = int(group_sizes.sum())
    group_count = len(group_sizes)

    if sample_size < group_count:
        ranked_groups = group_sizes.sort_values(ascending=False).index[:sample_size]
        sampled_frames = [
            grouped.get_group(group).sample(n=1, random_state=seed + idx)
            for idx, group in enumerate(ranked_groups)
        ]
        sampled_df = pd.concat(sampled_frames).reset_index(drop=True)
        strata_details = []
        for idx, group in enumerate(ranked_groups):
            group_df = grouped.get_group(group)
            strata_details.append(
                {
                    "stratum": group if pd.notna(group) else "Missing",
                    "population_size": int(len(group_df)),
                    "exact_allocation": _round_float(len(group_df) / total * sample_size),
                    "allocated_sample_size": 1,
                    "calculation": f"Sample size is smaller than number of strata, so 1 row was taken from this stratum using seed {seed + idx}.",
                }
            )
        return sampled_df, {
            "strata_column": strata_column,
            "total_population": total,
            "strata": strata_details,
            "steps": [
                f"Grouped dataset by '{strata_column}' to create {group_count} strata.",
                "Because requested sample size is smaller than number of strata, the largest strata were given 1 sample each.",
            ],
        }

    exact_allocations = (group_sizes / total) * sample_size
    allocations = np.floor(exact_allocations).astype(int)
    remainder = sample_size - int(allocations.sum())

    if remainder > 0:
        fractional = (exact_allocations - allocations).sort_values(ascending=False)
        for group in fractional.index[:remainder]:
            allocations[group] += 1

    sampled_frames = []
    strata_details = []
    for idx, (group_name, group_df) in enumerate(grouped):
        n_group = int(min(allocations[group_name], len(group_df)))
        exact_value = float(exact_allocations[group_name])
        strata_details.append(
            {
                "stratum": group_name if pd.notna(group_name) else "Missing",
                "population_size": int(len(group_df)),
                "exact_allocation": _round_float(exact_value),
                "allocated_sample_size": n_group,
                "calculation": f"({int(len(group_df))} / {total}) * {sample_size} = {_round_float(exact_value)} -> allocated {n_group}",
            }
        )
        if n_group > 0:
            sampled_frames.append(group_df.sample(n=n_group, random_state=seed + idx))

    sampled = pd.concat(sampled_frames).sample(frac=1, random_state=seed).reset_index(drop=True)
    return sampled, {
        "strata_column": strata_column,
        "total_population": total,
        "strata": strata_details,
        "steps": [
            f"Grouped dataset by '{strata_column}' to create {group_count} strata.",
            f"Used proportional allocation: stratum_sample = (stratum_size / {total}) * {sample_size}.",
            "Fractional remainders were assigned from largest remainder to smallest until the full sample size was reached.",
        ],
    }


def cluster_sampling(df, sample_size, seed, cluster_size=50):
    if sample_size >= len(df):
        sampled_df = df.copy().reset_index(drop=True)
        return sampled_df, {
            "cluster_size": int(max(5, int(cluster_size))),
            "selected_clusters": [0],
            "clusters": [
                {
                    "cluster_id": 0,
                    "row_start": 0,
                    "row_end": int(len(df) - 1),
                    "cluster_population": int(len(df)),
                }
            ],
            "steps": [
                "Sample size is at least the dataset size, so all rows were selected as one full cluster view.",
            ],
        }

    cluster_size = max(5, int(cluster_size))
    working_df = df.reset_index(drop=True).copy()
    working_df["__cluster_id"] = working_df.index // cluster_size
    clusters = working_df["__cluster_id"].unique().tolist()

    rng = np.random.default_rng(seed)
    rng.shuffle(clusters)

    chosen = []
    collected = 0
    for cluster in clusters:
        chosen.append(cluster)
        collected += int((working_df["__cluster_id"] == cluster).sum())
        if collected >= sample_size:
            break

    cluster_details = []
    for cluster in chosen:
        cluster_df = working_df[working_df["__cluster_id"] == cluster]
        cluster_details.append(
            {
                "cluster_id": int(cluster),
                "row_start": int(cluster_df.index.min()),
                "row_end": int(cluster_df.index.max()),
                "cluster_population": int(len(cluster_df)),
            }
        )

    selected = working_df[working_df["__cluster_id"].isin(chosen)].drop(columns="__cluster_id")

    if len(selected) > sample_size:
        selected = selected.sample(n=sample_size, random_state=seed)

    selected = selected.reset_index(drop=True)
    return selected, {
        "cluster_size": int(cluster_size),
        "selected_clusters": [int(cluster) for cluster in chosen],
        "clusters": cluster_details,
        "rows_collected_before_trim": int(collected),
        "steps": [
            f"Created contiguous clusters of size {int(cluster_size)} using row index // cluster_size.",
            f"Shuffled cluster order using seed {seed} and selected clusters until at least {sample_size} rows were covered.",
            f"Rows covered by selected clusters before trimming: {int(collected)}.",
            "If cluster rows exceeded the requested sample size, a final random trim was applied.",
        ],
    }


def generate_sample(
    technique,
    sample_size,
    seed=42,
    strata_column="food_encoded",
    preview_limit=15,
):
    df = load_dataset()
    sample_size = _sanitize_sample_size(sample_size, len(df))
    seed = int(seed)

    if technique == "random":
        sampled_df, calculation = random_sampling(df, sample_size, seed)
    elif technique == "systematic":
        sampled_df, calculation = systematic_sampling(df, sample_size, seed)
    elif technique == "stratified":
        sampled_df, calculation = stratified_sampling(df, sample_size, seed, strata_column=strata_column)
    elif technique == "cluster":
        sampled_df, calculation = cluster_sampling(df, sample_size, seed)
    else:
        raise ValueError(
            f"Unsupported sampling technique '{technique}'. "
            f"Use one of: {', '.join(TECHNIQUE_DEFINITIONS.keys())}."
        )

    preview = sampled_df.head(preview_limit)
    emission_col = "emission" if "emission" in df.columns else None

    response = {
        "technique": technique,
        "technique_label": TECHNIQUE_DEFINITIONS[technique]["label"],
        "sample_size": int(len(sampled_df)),
        "dataset_size": int(len(df)),
        "columns": sampled_df.columns.tolist(),
        "preview_limit": int(preview_limit),
        "preview_rows": _as_python_records(preview),
        "summary": {},
        "calculation": calculation,
    }

    if emission_col:
        response["summary"] = {
            "dataset_emission_mean": round(float(df[emission_col].mean()), 4),
            "sample_emission_mean": round(float(sampled_df[emission_col].mean()), 4),
            "dataset_emission_std": round(float(df[emission_col].std()), 4),
            "sample_emission_std": round(float(sampled_df[emission_col].std()), 4),
        }

    return response
