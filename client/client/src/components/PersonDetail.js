import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Card, Typography, Button, Spin, Alert } from 'antd';
import { Link } from 'react-router-dom';
import { GET_PERSON_WITH_CARS } from '../graphql/queries';

const { Title, Text } = Typography;

const PersonDetail = () => {
  const { id } = useParams(); 
  const { loading, error, data } = useQuery(GET_PERSON_WITH_CARS, {
    variables: { id }
  });

  if (loading) return <Spin size="large" />;
  if (error) return <Alert message={`Error: ${error.message}`} type="error" />;

  const person = data?.personWithCars;

  if (!person) {
    return <Alert message="Person not found" type="error" />;
  }

  const formatPrice = price => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/">
        <Button type="primary" style={{ marginBottom: 16 }}>GO BACK HOME</Button>
      </Link>
      
      <Card
        title={`${person.firstName} ${person.lastName}`}
        style={{ marginBottom: 24 }}
      >
        <Title level={4}>Cars Owned:</Title>
        {person.cars && person.cars.length > 0 ? (
          person.cars.map(car => (
            <div key={car.id} style={{ 
              marginBottom: 8, 
              padding: '8px',
              backgroundColor: '#fafafa',
              borderRadius: '4px'
            }}>
              <Text strong>
                {car.year} {car.make} {car.model} - {formatPrice(car.price)}
              </Text>
            </div>
          ))
        ) : (
          <Text>No cars owned</Text>
        )}
      </Card>
    </div>
  );
};

export default PersonDetail;