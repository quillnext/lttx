export async function fetchPublicExperts({ from = 0, to = 29 } = {}) {
  const params = new URLSearchParams({
    from: String(from),
    to: String(to),
  });

  const response = await fetch(`/api/ask-an-expert/profiles?${params.toString()}`, {
    cache: "no-store",
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch experts");
  }

  return result;
}

export async function fetchExpertsByIds(ids = []) {
  if (!ids.length) return [];

  const params = new URLSearchParams({ ids: ids.join(",") });
  const response = await fetch(`/api/ask-an-expert/profiles?${params.toString()}`, {
    cache: "no-store",
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch matched experts");
  }

  return result.experts || [];
}

export async function fetchRecentSearchQueries({ exclude = "", limit = 5 } = {}) {
  const params = new URLSearchParams({
    exclude,
    limit: String(limit),
  });

  const response = await fetch(`/api/ask-an-expert/recent-searches?${params.toString()}`, {
    cache: "no-store",
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch recent searches");
  }

  return result.searches || [];
}
