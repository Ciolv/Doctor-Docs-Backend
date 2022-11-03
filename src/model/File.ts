export class File {
  id = "";
  name: string;
  content: object;
  parent: string;

  constructor(name: string, content: object, parent: string) {
    this.name = name;
    this.content = content;
    this.parent = parent;
  }
}
