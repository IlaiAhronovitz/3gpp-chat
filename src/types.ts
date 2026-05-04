export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface Settings {
  apiKey: string;
  model: string;
}
