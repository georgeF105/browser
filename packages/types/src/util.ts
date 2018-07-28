export type ItemKey = string | number;

export interface TreeItemBase {
  id: ItemKey;
  items: Array<TreeItemBase | any> | null;
}

export interface NormalTreeItem <T extends TreeItemBase> {
  items: Array<string>;
  parent: string;
}