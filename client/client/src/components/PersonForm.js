import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Form, Input, Button } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { ADD_PERSON, GET_PEOPLE } from '../graphql/queries';

const PersonForm = () => {
  const [form] = Form.useForm();
  const [id] = useState(uuidv4());
  const [addPerson] = useMutation(ADD_PERSON, {
    update(cache, { data: { addPerson } }) {
      const data = cache.readQuery({ query: GET_PEOPLE });
      cache.writeQuery({
        query: GET_PEOPLE,
        data: {
          people: [...data.people, addPerson]
        }
      });
    }
  });

  const onFinish = values => {
    addPerson({
      variables: {
        id,
        firstName: values.firstName,
        lastName: values.lastName
      }
    });
    form.resetFields();
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item
        name="firstName"
        label="First Name"
        rules={[{ required: true, message: 'Please enter first name' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="lastName"
        label="Last Name"
        rules={[{ required: true, message: 'Please enter last name' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Add Person
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PersonForm;