"use client"

import React from "react"
import { Form, Input, Button, message, Tabs } from "antd"
import api from "../../services/api"

const { TabPane } = Tabs

const RegisterServicePage = () => {
  const onFinish = async (values) => {
    try {
      await api.post("/provider/register-service", values)
      message.success("Service registered successfully!")
    } catch (error) {
      message.error("Failed to register service")
    }
  }

  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="Venue" key="1">
        <Form onFinish={onFinish}>
          <Form.Item name="name" label="Venue Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </TabPane>
      {/* Add other tabs for Catering, Photography, etc. */}
    </Tabs>
  )
}

export default RegisterServicePage