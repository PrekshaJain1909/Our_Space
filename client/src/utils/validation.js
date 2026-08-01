/* ---------------------- Required field ---------------------- */
export const isRequired = (value) =>
  value !== undefined &&
  value !== null &&
  String(value).trim() !== "";

/* ---------------------- Email validation --------------------- */
export const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).toLowerCase());

/* ---------------------- Min length --------------------------- */
export const minLength = (value, len) =>
  String(value).trim().length >= len;

/* ---------------------- Max length --------------------------- */
export const maxLength = (value, len) =>
  String(value).trim().length <= len;

/* ---------------------- Password Policy ---------------------- */
export const isStrongPassword = (value) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
// at least 8 chars, 1 uppercase, 1 lowercase, 1 number

/* ---------------------- Date validity ------------------------ */
export const isValidDate = (value) => !isNaN(new Date(value).getTime());

/* ---------------------- Future date check -------------------- */
export const isFutureDate = (value) =>
  new Date(value).getTime() > new Date().getTime();

/* ---------------------- Number validation -------------------- */
export const isNumber = (value) =>
  /^-?\d+(\.\d+)?$/.test(String(value));

export const isPositiveNumber = (value) =>
  isNumber(value) && Number(value) > 0;

/* ---------------------- Multiple Errors Helper --------------- */
export const validateFields = (form, rules) => {
  // rules = { fieldName: [{ validator: fn, message: "" }, ...] }
  const errors = {};

  for (const key in rules) {
    const validators = rules[key];
    for (const rule of validators) {
      if (!rule.validator(form[key])) {
        errors[key] = rule.message;
        break; // stop after first failure
      }
    }
  }

  return errors;
};
