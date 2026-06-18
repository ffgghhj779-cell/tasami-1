/**
 * Converts Western Arabic digits (0-9) to Eastern Arabic-Indic numerals (٠-٩).
 * All numerical displays in the UI must use this function.
 */
export const toEasternArabic = (n: number | string): string =>
  String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);

/**
 * Speaks the given text using the Web Speech API.
 * Connected to window.speechSynthesis as required by the A11Y spec.
 */
export const speak = (text: string, lang = 'ar') => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  window.speechSynthesis.speak(utterance);
};
