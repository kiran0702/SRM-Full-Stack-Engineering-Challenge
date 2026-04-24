import axios from "axios";

const BASE_URL = "https://bfhl-backend-9bl6.onrender.com";

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const postEdges = async (edgeArray) => {
  const response = await client.post("/bfhl", { data: edgeArray });
  return response.data;
};