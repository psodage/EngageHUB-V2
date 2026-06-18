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

export async function listLeads() {
  try {
    const { data } = await client.get("/api/leads");
    return data.data || [];
  } catch (error) {
    throw new Error(parseError(error, "Unable to load leads."));
  }
}

export async function getLead(id) {
  try {
    const { data } = await client.get(`/api/leads/${id}`);
    return data.data;
  } catch (error) {
    throw new Error(parseError(error, "Unable to load lead details."));
  }
}

export async function updateLeadStatus(id, status) {
  try {
    const { data } = await client.put(`/api/leads/${id}/status`, { status });
    return data.data;
  } catch (error) {
    throw new Error(parseError(error, "Unable to update lead status."));
  }
}

export async function updateLeadNotes(id, notes) {
  try {
    const { data } = await client.put(`/api/leads/${id}/notes`, { notes });
    return data.data;
  } catch (error) {
    throw new Error(parseError(error, "Unable to update lead notes."));
  }
}

export async function sendLeadMessage(id, text) {
  try {
    const { data } = await client.post(`/api/leads/${id}/message`, { text });
    return data.data;
  } catch (error) {
    throw new Error(parseError(error, "Unable to send message."));
  }
}

export async function deleteLead(id) {
  try {
    await client.delete(`/api/leads/${id}`);
  } catch (error) {
    throw new Error(parseError(error, "Unable to delete lead."));
  }
}

export async function listAutoReplyRules() {
  try {
    const { data } = await client.get("/api/leads/rules");
    return data.data || [];
  } catch (error) {
    throw new Error(parseError(error, "Unable to load auto-reply rules."));
  }
}

export async function createAutoReplyRule(payload) {
  try {
    const { data } = await client.post("/api/leads/rules", payload);
    return data.data;
  } catch (error) {
    throw new Error(parseError(error, "Unable to create auto-reply rule."));
  }
}

export async function updateAutoReplyRule(id, payload) {
  try {
    const { data } = await client.put(`/api/leads/rules/${id}`, payload);
    return data.data;
  } catch (error) {
    throw new Error(parseError(error, "Unable to update auto-reply rule."));
  }
}

export async function deleteAutoReplyRule(id) {
  try {
    await client.delete(`/api/leads/rules/${id}`);
  } catch (error) {
    throw new Error(parseError(error, "Unable to delete auto-reply rule."));
  }
}

export async function simulateIncomingLeadEvent(payload) {
  try {
    const { data } = await client.post("/api/leads/simulate", payload);
    return data.data;
  } catch (error) {
    throw new Error(parseError(error, "Unable to simulate lead event."));
  }
}
