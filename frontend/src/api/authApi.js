import client from './client';

export const login = async (userName, password) => {
  // Returns { token: "<jwt>" } or throws error
  const response = await client.post('public/login', { userName, password });
  return response.data;
};

export const signup = async (userName, email, password, sentimentAnalysis) => {
  const response = await client.post('public/signup', {
    userName,
    email,
    password,
    sentimentAnalysis,
  });
  return response.data;
};

export const firebaseLogin = async (idToken) => {
  const response = await client.post('public/firebase-login', { idToken });
  return response.data;
};
