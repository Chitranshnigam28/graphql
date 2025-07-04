import find from "lodash.find";
import remove from "lodash.remove";
import filter from "lodash.filter";


let people = [
  {
    id: '1',
    firstName: 'Bill',
    lastName: 'Gates'
  },
  {
    id: '2',
    firstName: 'Steve',
    lastName: 'Jobs'
  },
  {
    id: '3',
    firstName: 'Linux',
    lastName: 'Torvalds'
  }
];

let cars = [
  {
    id: '1',
    year: 2019,
    make: 'Toyota',
    model: 'Corolla',
    price: 40000,
    personId: '1'
  },
  {
    id: '2',
    year: 2018,
    make: 'Lexus',
    model: 'LX 600',
    price: 13000,
    personId: '1'
  },
  {
    id: '3',
    year: 2017,
    make: 'Honda',
    model: 'Civic',
    price: 20000,
    personId: '1'
  },
  {
    id: '4',
    year: 2019,
    make: 'Acura',
    model: 'MDX',
    price: 60000,
    personId: '2'
  },
  {
    id: '5',
    year: 2018,
    make: 'Ford',
    model: 'Focus',
    price: 35000,
    personId: '2'
  },
  {
    id: '6',
    year: 2017,
    make: 'Honda',
    model: 'Pilot',
    price: 45000,
    personId: '2'
  },
  {
    id: '7',
    year: 2019,
    make: 'Volkswagen',
    model: 'Golf',
    price: 40000,
    personId: '3'
  },
  {
    id: '8',
    year: 2018,
    make: 'Kia',
    model: 'Sorento',
    price: 45000,
    personId: '3'
  },
  {
    id: '9',
    year: 2017,
    make: 'Volvo',
    model: 'XC40',
    price: 55000,
    personId: '3'
  }
];

const typeDefs = `
  type Person {
    id: String!
    firstName: String!
    lastName: String!
  }

  type Car {
    id: String!
    year: Int!
    make: String!
    model: String!
    price: Float!
    personId: String!
  }

  type PersonWithCars {
    id: String!
    firstName: String!
    lastName: String!
    cars: [Car]
  }

  type Query {
    people: [Person]
    person(id: String!): Person
    cars: [Car]
    car(id: String!): Car
    personWithCars(id: String!): PersonWithCars
  }

  type Mutation {
    addPerson(id: String!, firstName: String!, lastName: String!): Person
    updatePerson(id: String!, firstName: String!, lastName: String!): Person
    removePerson(id: String!): Person
    
    addCar(
      id: String!
      year: Int!
      make: String!
      model: String!
      price: Float!
      personId: String!
    ): Car
    
    updateCar(
      id: String!
      year: Int!
      make: String!
      model: String!
      price: Float!
      personId: String!
    ): Car
    
    removeCar(id: String!): Car
  }
`;

const resolvers = {
  Query: {
    people: () => people,
    person: (_, { id }) => find(people, { id }),
    cars: () => cars,
    car: (_, { id }) => find(cars, { id }),
    personWithCars: (_, { id }) => {
      const person = find(people, { id });
      if (!person) return null;
      
      return {
        ...person,
        cars: filter(cars, { personId: id })
      };
    }
  },
  
  Mutation: {
    addPerson: (_, { id, firstName, lastName }) => {
      const newPerson = { id, firstName, lastName };
      people.push(newPerson);
      return newPerson;
    },
    
    updatePerson: (_, { id, firstName, lastName }) => {
      const person = find(people, { id });
      if (!person) throw new Error(`Person with id ${id} not found`);
      
      person.firstName = firstName;
      person.lastName = lastName;
      return person;
    },
    
    removePerson: (_, { id }) => {
      const personToRemove = find(people, { id });
      if (!personToRemove) throw new Error(`Person with id ${id} not found`);
      
      
      cars = cars.filter(car => car.personId !== id);
      
      people = people.filter(person => person.id !== id);
      
      return personToRemove;
    },
    
    addCar: (_, { id, year, make, model, price, personId }) => {
      const newCar = { id, year, make, model, price, personId };
      cars.push(newCar);
      return newCar;
    },
    
    updateCar: (_, { id, year, make, model, price, personId }) => {
      const car = find(cars, { id });
      if (!car) throw new Error(`Car with id ${id} not found`);
      
      car.year = year;
      car.make = make;
      car.model = model;
      car.price = price;
      car.personId = personId;
      return car;
    },
    
    removeCar: (_, { id }) => {
      const carToRemove = find(cars, { id });
      if (!carToRemove) throw new Error(`Car with id ${id} not found`);
      
      cars = cars.filter(car => car.id !== id);
      return carToRemove;
    }
  }
};

export { typeDefs, resolvers };

