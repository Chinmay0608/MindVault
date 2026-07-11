import client from './client';

export const getMe = async () => {
  const response = await client.get('user/me');
  return response.data;
};

export const updateUser = async (userData) => {
  // userData: { userName, email, password, sentimentAnalysis }
  const response = await client.put('user', userData);
  return response.data;
};

export const deleteUser = async () => {
  const response = await client.delete('user');
  return response.data;
};
