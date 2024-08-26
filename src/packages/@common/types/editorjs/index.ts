export interface Block {
  id: string;
  type: string;
  data: {
    text?: string;
    style?: string;
    items?: string[];
    code?: string;
  };
  level?: number;
}
