import axios from "axios";
import { STORAGE_KEYS } from "../data/constants";
import { getClientApiBaseUrl } from "../config/api.js";
import { formatHttpApiError } from "../utils/httpApiError";

const client = axios.create({
  baseURL: getClientApiBaseUrl(),
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.authToken);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function parseError(error, fallback) {
  return formatHttpApiError(error, fallback).message;
}

export async function listCampaigns() {
  try {
    const { data } = await client.get("/api/campaigns");
    return data;
  } catch (error) {
    throw new Error(parseError(error, "Unable to load campaigns."));
  }
}

export async function createCampaign(payload) {
  try {
    const { data } = await client.post("/api/campaigns", payload);
    return data;
  } catch (error) {
    throw new Error(parseError(error, "Unable to create campaign."));
  }
}

export async function getCampaign(id) {
  try {
    const { data } = await client.get(`/api/campaigns/${id}`);
    return data; // returns { campaign, posts }
  } catch (error) {
    throw new Error(parseError(error, "Unable to load campaign details."));
  }
}

export async function updateCampaign(id, payload) {
  try {
    const { data } = await client.put(`/api/campaigns/${id}`, payload);
    return data;
  } catch (error) {
    throw new Error(parseError(error, "Unable to update campaign."));
  }
}

export async function deleteCampaign(id) {
  try {
    await client.delete(`/api/campaigns/${id}`);
  } catch (error) {
    throw new Error(parseError(error, "Unable to delete campaign."));
  }
}
