export function formToObject(form) {
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries());
}
