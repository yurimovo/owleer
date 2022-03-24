export const validateEmptyField = (fieldValue: string) => {
  const value = fieldValue.trim();
  return value.length > 0;
};
