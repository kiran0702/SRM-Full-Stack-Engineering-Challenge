import axios from "axios";

const API_URL = "http://localhost:3000";

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const postEdges = async (edgeArray) => {
  const response = await client.post("/bfhl", { data: edgeArray });
  return response.data;
};

export const healthCheck = async () => {
  const response = await client.get("/bfhl");
  return response.data;
};
