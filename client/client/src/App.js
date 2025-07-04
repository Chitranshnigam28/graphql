// import React from 'react';
// import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
// import { Typography, Divider } from 'antd';
// import PersonForm from './components/PersonForm';
// import CarForm from './components/CarForm';
// import PeopleList from './components/PeopleList';

// const { Title } = Typography;

// const client = new ApolloClient({
//   uri: 'http://localhost:4000/graphql',
//   cache: new InMemoryCache()
// });

// function App() {
//   return (
//     <ApolloProvider client={client}>
//       <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
//         <Title level={1} style={{ textAlign: 'center', marginBottom: '24px' }}>PEOPLE AND THEIR CARS</Title>
        
//         <Title level={2} style={{ marginBottom: '16px' }}>Add Person</Title>
//         <PersonForm />
        
//         <Divider />
        
//         <Title level={2} style={{ marginBottom: '16px' }}>Add Car</Title>
//         <CarForm />
        
//         <Divider />
        
//         <Title level={2} style={{ marginBottom: '16px' }}>Records</Title>
//         <PeopleList />
//       </div>
//     </ApolloProvider>
//   );
// }

// export default App;
import React from 'react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { Typography, Divider } from 'antd';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PersonForm from './components/PersonForm';
import CarForm from './components/CarForm';
import PeopleList from './components/PeopleList';
import PersonDetail from './components/PersonDetail';

const { Title } = Typography;

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache()
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Routes>
          <Route path="/people/:id" element={<PersonDetail />} />
          <Route path="/" element={
            <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
              <Title level={1} style={{ textAlign: 'center', marginBottom: '24px' }}>PEOPLE AND THEIR CARS</Title>
              
              <Title level={2} style={{ marginBottom: '16px' }}>Add Person</Title>
              <PersonForm />
              
              <Divider />
              
              <Title level={2} style={{ marginBottom: '16px' }}>Add Car</Title>
              <CarForm />
              
              <Divider />
              
              <Title level={2} style={{ marginBottom: '16px' }}>Records</Title>
              <PeopleList />
            </div>
          } />
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

export default App;