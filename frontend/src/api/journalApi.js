import client from './client';

export const getEntries = async ({ page = 0, size = 10, sort = 'date,desc', tag = '' } = {}) => {
  const params = { page, size, sort };
  if (tag && tag.trim()) params.tag = tag.trim();
  const response = await client.get('', { params });
  return response.data;
};

export const searchEntries = async ({ q, page = 0, size = 10, sort = 'date,desc' } = {}) => {
  const params = { q, page, size, sort };
  const response = await client.get('search', { params });
  return response.data;
};

export const getAll = getEntries;

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
