"use client"

import { useState } from "react"
import { Form, Input, Button, Card, Radio, message } from "antd"
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

const RegisterPage = () => {
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const onFinish = async (values) => {
    try {
      setLoading(true)

      // Check if passwords match
      if (values.password !== values.confirmPassword) {
        message.error("Passwords do not match!")
        return
      }

      const userData = {
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
        role: values.role,
      }

      const user = await register(userData)

      message.success(`Welcome, ${user.name}!`)

     
      if (user.role === "ADMIN") {
        navigate("/admin")
      } else if (user.role === "PROVIDER") {
        navigate("/provider")
      } else {
        navigate("/user")
      }
    } catch (error) {
      message.error(error.message || "Failed to register")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", paddingTop: 50 }}>
      <Card title="Register" bordered={false}>
        <Form name="register" initialValues={{ role: "USER" }} onFinish={onFinish}>
          <Form.Item name="name" rules={[{ required: true, message: "Please input your name!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Full Name" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item name="phone" rules={[{ required: true, message: "Please input your phone number!" }]}>
            <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: "Please input your password!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item name="confirmPassword" rules={[{ required: true, message: "Please confirm your password!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
          </Form.Item>

          <Form.Item name="role" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="USER">Regular User</Radio>
              <Radio value="PROVIDER">Service Provider</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: "100%" }}>
              Register
            </Button>
            Already have an account? <Link to="/login">Login</Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default RegisterPage
