export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error.response) {
    return error.code === 'ECONNABORTED'
      ? 'The request took too long. Please try again.'
      : 'We could not reach the server. Check your connection and try again.';
  }

  const data = error.response.data;

  if (data?.errors?.length) {
    return data.errors.map((item) => item.message).join(' ');
  }

  return data?.message || fallback;
}
