import axios from "axios";
import { getClientApiBaseUrl } from "../config/api.js";
import { STORAGE_KEYS } from "../data/constants";
import { formatHttpApiError } from "../utils/httpApiError";

const client = axios.create({ baseURL: getClientApiBaseUrl() });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.authToken);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function parseError(error, fallback) {
  return formatHttpApiError(error, fallback).message;
}

export async function generateInfluencerContent(payload) {
  try {
    const { data } = await client.post("/api/ai/generate-influencer-content", payload);
    return data.variants || [];
  } catch (error) {
    throw new Error(parseError(error, "Unable to generate influencer content."));
  }
}
