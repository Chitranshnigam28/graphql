import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { List, Card, Typography, Button, Form, Input, Select, message } from 'antd';
import { EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { GET_PEOPLE, GET_CARS, UPDATE_PERSON, UPDATE_CAR, REMOVE_PERSON, REMOVE_CAR } from '../graphql/queries';

const { Text } = Typography;
const { Option } = Select;

const PeopleList = () => {
  const { loading: peopleLoading, data: peopleData, refetch: refetchPeople } = useQuery(GET_PEOPLE);
  const { loading: carsLoading, data: carsData, refetch: refetchCars } = useQuery(GET_CARS);
  
  const [removePerson] = useMutation(REMOVE_PERSON, {
    onCompleted: () => {
      refetchPeople();
      refetchCars();
      message.success('Person deleted successfully');
    }
  });
  
  const [removeCar] = useMutation(REMOVE_CAR, {
    onCompleted: () => {
      refetchCars();
      message.success('Car deleted successfully');
    }
  });
  
  const [updatePerson] = useMutation(UPDATE_PERSON, {
    onCompleted: () => {
      refetchPeople();
      message.success('Person updated successfully');
    }
  });
  
  const [updateCar] = useMutation(UPDATE_CAR, {
    onCompleted: () => {
      refetchCars();
      message.success('Car updated successfully');
    }
  });

  const [editingPerson, setEditingPerson] = useState(null);
  const [editingCar, setEditingCar] = useState(null);
  const [personForm] = Form.useForm();
  const [carForm] = Form.useForm();

  if (peopleLoading || carsLoading) return <p>Loading...</p>;

  const getCarsByPersonId = personId => {
    if (!carsData?.cars) return [];
    return carsData.cars.filter(car => car.personId === personId);
  };

  const formatPrice = price => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleDeletePerson = async (id) => {
    if (window.confirm('Are you sure you want to delete this person and all their cars?')) {
      await removePerson({ variables: { id } });
    }
  };

  const handleDeleteCar = async (id) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      await removeCar({ variables: { id } });
    }
  };

  const handleEditPerson = (person) => {
    setEditingPerson(person.id);
    personForm.setFieldsValue({
      firstName: person.firstName,
      lastName: person.lastName
    });
  };

  const handleEditCar = (car) => {
    setEditingCar(car.id);
    carForm.setFieldsValue({
      year: car.year,
      make: car.make,
      model: car.model,
      price: car.price,
      personId: car.personId
    });
  };

  const handleSavePerson = async (personId) => {
    try {
      const values = await personForm.validateFields();
      await updatePerson({
        variables: {
          id: personId,
          firstName: values.firstName,
          lastName: values.lastName
        }
      });
      setEditingPerson(null);
    } catch (error) {
      message.error(`Error updating person: ${error.message}`);
    }
  };

  const handleSaveCar = async (carId) => {
    try {
      const values = await carForm.validateFields();
      await updateCar({
        variables: {
          id: carId,
          year: parseInt(values.year),
          make: values.make,
          model: values.model,
          price: parseFloat(values.price),
          personId: values.personId
        }
      });
      setEditingCar(null);
    } catch (error) {
      message.error(`Error updating car: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingPerson(null);
    setEditingCar(null);
  };

  return (
    <List
      dataSource={peopleData.people}
      renderItem={person => (
        <List.Item>
          <Card
            style={{ width: '100%', maxWidth: '800px' }}
            title={
              editingPerson === person.id ? (
                <Form form={personForm} layout="inline" style={{ width: '100%' }}>
                  <Form.Item name="firstName" style={{ flex: 1, marginRight: 8 }}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="lastName" style={{ flex: 1, marginRight: 8 }}>
                    <Input />
                  </Form.Item>
                  <Button icon={<SaveOutlined />} onClick={() => handleSavePerson(person.id)} />
                  <Button icon={<CloseOutlined />} onClick={handleCancelEdit} style={{ marginLeft: 8 }} />
                </Form>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{person.firstName} {person.lastName}</span>
                  <div>
                    <Button 
                      icon={<EditOutlined />} 
                      onClick={() => handleEditPerson(person)}
                      style={{ marginRight: 8 }}
                    />
                    <Button 
                      icon={<DeleteOutlined />} 
                      onClick={() => handleDeletePerson(person.id)}
                      danger
                    />
                  </div>
                </div>
              )
            }
          >
            {getCarsByPersonId(person.id).map(car => (
              <div key={car.id} style={{ marginBottom: 8 }}>
                {editingCar === car.id ? (
                  <Form form={carForm} layout="inline" style={{ width: '100%' }}>
                    <Form.Item name="year" style={{ width: 80, marginRight: 8 }}>
                      <Input type="number" />
                    </Form.Item>
                    <Form.Item name="make" style={{ width: 100, marginRight: 8 }}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="model" style={{ width: 100, marginRight: 8 }}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="price" style={{ width: 100, marginRight: 8 }}>
                      <Input type="number" step="0.01" />
                    </Form.Item>
                    <Form.Item name="personId" style={{ width: 150, marginRight: 8 }}>
                      <Select>
                        {peopleData.people.map(p => (
                          <Option key={p.id} value={p.id}>
                            {p.firstName} {p.lastName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Button icon={<SaveOutlined />} onClick={() => handleSaveCar(car.id)} />
                    <Button icon={<CloseOutlined />} onClick={handleCancelEdit} style={{ marginLeft: 8 }} />
                  </Form>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>
                      {car.year} {car.make} {car.model} - {formatPrice(car.price)}
                    </Text>
                    <div>
                      <Button 
                        icon={<EditOutlined />} 
                        size="small" 
                        onClick={() => handleEditCar(car)}
                        style={{ marginRight: 8 }}
                      />
                      <Button 
                        icon={<DeleteOutlined />} 
                        size="small" 
                        onClick={() => handleDeleteCar(car.id)}
                        danger
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </Card>
        </List.Item>
      )}
    />
  );
};

export default PeopleList;