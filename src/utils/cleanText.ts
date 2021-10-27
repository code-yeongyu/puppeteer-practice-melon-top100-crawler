const cleanText = (text: string | null) => {
  if (!text) {
    return "";
  }
  text = text.trim();
  text = text.replaceAll("\n", "");
  text = text.replaceAll("\t", "");
  return text;
};

export default cleanText;
