export function speak(text: string) {
  if (!text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = /[\u4e00-\u9fff]/.test(text) ? "zh-CN" : "en-US";
  speechSynthesis.speak(utterance);
}
