export const parseNumber = (value: any, defaultValue: Number): any => {
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? defaultValue : num;
};

export default parseNumber;
