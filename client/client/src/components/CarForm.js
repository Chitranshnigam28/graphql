import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Form, Input, Button, Select, message } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { ADD_CAR, GET_PEOPLE, GET_CARS } from '../graphql/queries';

const { Option } = Select;

const CarForm = () => {
  const [form] = Form.useForm();
  const [id,setId] = useState(uuidv4());
  const { loading, data } = useQuery(GET_PEOPLE);
  const [addCar] = useMutation(ADD_CAR, {
    update: (cache, { data: { addCar } }) => {
      try {
        
        const existingData = cache.readQuery({ query: GET_CARS });
        cache.writeQuery({
          query: GET_CARS,
          data: {
            cars: [...existingData.cars, addCar]
          }
        });
      } catch (error) {
        console.error('Error updating cache:', error);
      }
    },
    onCompleted: () => {
      message.success('Car added successfully!');
    },
    onError: (error) => {
      message.error(`Error adding car: ${error.message}`);
    }
  });

  const onFinish = values => {
    addCar({
      variables: {
        id,
        year: parseInt(values.year),
        make: values.make,
        model: values.model,
        price: parseFloat(values.price),
        personId: values.personId
      }
    });
    form.resetFields();
    setId(uuidv4());
  };

  if (loading) return null;

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item
        name="year"
        label="Year"
        rules={[{ required: true, message: 'Please enter year' }]}
      >
        <Input type="number" />
      </Form.Item>
      <Form.Item
        name="make"
        label="Make"
        rules={[{ required: true, message: 'Please enter make' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="model"
        label="Model"
        rules={[{ required: true, message: 'Please enter model' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="price"
        label="Price"
        rules={[{ required: true, message: 'Please enter price' }]}
      >
        <Input type="number" step="0.01" />
      </Form.Item>
      <Form.Item
        name="personId"
        label="Select a person"
        rules={[{ required: true, message: 'Please select owner' }]}
      >
        <Select disabled={!data?.people?.length}>
          {data?.people?.map(person => (
            <Option key={person.id} value={person.id}>
              {person.firstName} {person.lastName}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit"
          disabled={!data?.people?.length}
        >
          Add Car
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CarForm;