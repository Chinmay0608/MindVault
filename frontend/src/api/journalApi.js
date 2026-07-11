import client from './client';

export const getAll = async () => {
  const response = await client.get('');
  return response.data;
};

export const getById = async (id) => {
  const response = await client.get(`id/${id}`);
  return response.data;
};

export const create = async (entryData) => {
  // entryData: { title, content, sentiment }
  const response = await client.post('', entryData);
  return response.data;
};

export const update = async (id, entryData) => {
  const response = await client.put(`id/${id}`, entryData);
  return response.data;
};

export const remove = async (id) => {
  const response = await client.delete(`id/${id}`);
  return response.data;
};

export const getSentiment = async (id) => {
  const response = await client.get(`id/${id}/sentiment`);
  return response.data;
};
