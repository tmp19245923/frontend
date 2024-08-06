type Ticket = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export type Tickets = Ticket[];

type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
};

export type Users = User[];
