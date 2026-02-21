export interface Card {
  id: string;
  title: string;
  description: string;
  tag: string;
  priority: "low" | "medium" | "high";
  assignee: string;
  dueDate?: string;
}

export interface Column {
  id: string;
  title: string;
  color: string;
  cards: Card[];
}
