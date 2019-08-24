export const withComma = (value: number) =>
  value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
