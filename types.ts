export interface NodeData {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  subNodes?: NodeData[];
}
