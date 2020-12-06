import { RunResult } from "sqlite3";

/**
 * Parses an object as a number
 * @param value the object to parse
 * @param defaultValue the value if object can't be parsed
 */
export const parseNumber = (value: any, defaultValue: Number): any => {
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? defaultValue : num;
};

export default parseNumber;
