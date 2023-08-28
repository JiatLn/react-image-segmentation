export function formatLabel(text: string) {
  text = text.split('_').join(' ');
  text = text.replace(/([A-Z])/g, ' $1');
  return text.charAt(0).toUpperCase() + text.slice(1);
}
