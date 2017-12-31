export function trimString (rawStr) {
  return rawStr.replace(/[\n\r]+/g, '').replace(/\s{2,10}/g, ' ')
}
