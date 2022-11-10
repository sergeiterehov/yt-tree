export type IMockItem = {
  id: number;
  children: IMockItem[];
  name: string;
};

const mockList = ((): IMockItem[] => {
  let ai = 0;

  const generateNodes = (prefix: string, ...counts: number[]) => {
    if (!counts.length) return [];

    const nodes: IMockItem[] = [];
    const count = counts[0];

    for (let level1 = 0; level1 < count; level1 += 1) {
      ai += 1;

      const name = `${prefix} - ${ai}`;
      const node = {
        id: ai,
        name,
        children: generateNodes(name, ...counts.slice(1)),
      };

      nodes.push(node);
    }

    return nodes;
  };

  return generateNodes("item", 10, 30, 30, 30);
})();

export default mockList;
