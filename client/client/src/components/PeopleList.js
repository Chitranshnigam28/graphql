import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { List, Card, Typography, Button, Form, Input, Select, message, Space } from 'antd';
import { EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { GET_PEOPLE, GET_CARS, UPDATE_PERSON, UPDATE_CAR, REMOVE_PERSON, REMOVE_CAR } from '../graphql/queries';

const { Text } = Typography;
const { Option } = Select;

const PeopleList = () => {
  const { loading: peopleLoading, data: peopleData } = useQuery(GET_PEOPLE);
  const { loading: carsLoading, data: carsData } = useQuery(GET_CARS);
  
  const [removePerson] = useMutation(REMOVE_PERSON, {
    update(cache, { data: { removePerson } }) {
      const { people } = cache.readQuery({ query: GET_PEOPLE });
      cache.writeQuery({
        query: GET_PEOPLE,
        data: {
          people: people.filter(person => person.id !== removePerson.id)
        }
      });
      
      const { cars } = cache.readQuery({ query: GET_CARS });
      const updatedCars = cars.filter(car => car.personId !== removePerson.id);
      cache.writeQuery({
        query: GET_CARS,
        data: { cars: updatedCars }
      });
    },
    onCompleted: () => {
      message.success('Person deleted successfully');
    }
  });
  
  const [removeCar] = useMutation(REMOVE_CAR, {
    update(cache, { data: { removeCar } }) {
      const { cars } = cache.readQuery({ query: GET_CARS });
      cache.writeQuery({
        query: GET_CARS,
        data: {
          cars: cars.filter(car => car.id !== removeCar.id)
        }
      });
    },
    onCompleted: () => {
      message.success('Car deleted successfully');
    }
  });
  
  const [updatePerson] = useMutation(UPDATE_PERSON, {
    update(cache, { data: { updatePerson } }) {
      const { people } = cache.readQuery({ query: GET_PEOPLE });
      cache.writeQuery({
        query: GET_PEOPLE,
        data: {
          people: people.map(person => 
            person.id === updatePerson.id ? updatePerson : person
          )
        }
      });
    },
    onCompleted: () => {
      message.success('Person updated successfully');
    }
  });
  
  const [updateCar] = useMutation(UPDATE_CAR, {
    update(cache, { data: { updateCar } }) {
      const { cars } = cache.readQuery({ query: GET_CARS });
      cache.writeQuery({
        query: GET_CARS,
        data: {
          cars: cars.map(car => 
            car.id === updateCar.id ? updateCar : car
          )
        }
      });
    },
    onCompleted: () => {
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
      try {
        await removePerson({ variables: { id } });
      } catch (error) {
        message.error(`Error deleting person: ${error.message}`);
      }
    }
  };

  const handleDeleteCar = async (id) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await removeCar({ variables: { id } });
      } catch (error) {
        message.error(`Error deleting car: ${error.message}`);
      }
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
        },
        optimisticResponse: {
          updatePerson: {
            __typename: 'Person',
            id: personId,
            firstName: values.firstName,
            lastName: values.lastName
          }
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
        },
        optimisticResponse: {
          updateCar: {
            __typename: 'Car',
            id: carId,
            year: parseInt(values.year),
            make: values.make,
            model: values.model,
            price: parseFloat(values.price),
            personId: values.personId
          }
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
                  <Button 
                    icon={<SaveOutlined />} 
                    onClick={() => handleSavePerson(person.id)}
                    type="primary"
                  />
                  <Button 
                    icon={<CloseOutlined />} 
                    onClick={handleCancelEdit} 
                    style={{ marginLeft: 8 }}
                  />
                </Form>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '16px', fontWeight: '500' }}>
                    {person.firstName} {person.lastName}
                  </span>
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
            extra={
              <Link to={`/people/${person.id}`}>
                <Button type="link" icon={<InfoCircleOutlined />}>
                  LEARN MORE
                </Button>
              </Link>
            }
          >
            <Card
              title="Cars Owned"
              type="inner"
              bodyStyle={{ padding: 0 }}
            >
              {getCarsByPersonId(person.id).length > 0 ? (
                <List
                  dataSource={getCarsByPersonId(person.id)}
                  renderItem={car => (
                    <List.Item>
                      {editingCar === car.id ? (
                        <Form form={carForm} layout="inline" style={{ width: '100%' }}>
                          <Form.Item name="year" style={{ width: 80, marginRight: 8 }}>
                            <Input type="number" placeholder="Year" />
                          </Form.Item>
                          <Form.Item name="make" style={{ width: 100, marginRight: 8 }}>
                            <Input placeholder="Make" />
                          </Form.Item>
                          <Form.Item name="model" style={{ width: 100, marginRight: 8 }}>
                            <Input placeholder="Model" />
                          </Form.Item>
                          <Form.Item name="price" style={{ width: 100, marginRight: 8 }}>
                            <Input type="number" step="0.01" placeholder="Price" />
                          </Form.Item>
                          <Form.Item name="personId" style={{ width: 150, marginRight: 8 }}>
                            <Select placeholder="Owner">
                              {peopleData.people.map(p => (
                                <Option key={p.id} value={p.id}>
                                  {p.firstName} {p.lastName}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                          <Space>
                            <Button 
                              icon={<SaveOutlined />} 
                              onClick={() => handleSaveCar(car.id)}
                              type="primary"
                            />
                            <Button 
                              icon={<CloseOutlined />} 
                              onClick={handleCancelEdit} 
                            />
                          </Space>
                        </Form>
                      ) : (
                        <Card
                          size="small"
                          style={{ width: '100%' }}
                          actions={[
                            <EditOutlined key="edit" onClick={() => handleEditCar(car)} />,
                            <DeleteOutlined key="delete" onClick={() => handleDeleteCar(car.id)} />
                          ]}
                        >
                          <Card.Meta
                            title={`${car.year} ${car.make} ${car.model}`}
                            description={formatPrice(car.price)}
                          />
                        </Card>
                      )}
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ padding: '16px', textAlign: 'center' }}>
                  <Text type="secondary">No cars owned</Text>
                </div>
              )}
            </Card>
          </Card>
        </List.Item>
      )}
    />
  );
};

export default PeopleList;