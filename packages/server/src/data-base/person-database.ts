export const persons = [
  {
    id: '1',
    sex: 'male',
    name: 'miro'
  },
  {
    id: '2',
    sex: 'female',
    name: 'lala'
  },
  {
    id: '3',
    sex: 'male',
    name: 'joe'
  }
];

export const findPerson = (persons1: Array<any>, id: string) => {
  return persons1.find(person => person.id === id);
};

export const addPerson = (persons2: Array<any>, person: any) => {
  persons2.push(person);
  return person;
};
