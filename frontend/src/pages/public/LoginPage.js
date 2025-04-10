"use client"

import { useState } from "react"
import { Form, Input, Button, Card, message } from "antd"
import { UserOutlined, LockOutlined } from "@ant-design/icons"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

const LoginPage = () => {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const onFinish = async (values) => {
    try {
      setLoading(true)
      const user = await login(values.email, values.password)

      message.success(`Welcome back, ${user.name || "User"}!`)

      // Redirect based on user role
      if (user.role === "ADMIN") {
        navigate("/admin")
      } else if (user.role === "PROVIDER") {
        navigate("/provider")
      } else {
        navigate("/user")
      }
    } catch (error) {
      message.error(error.message || "Failed to login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", paddingTop: 50 }}>
      <Card title="Login" bordered={false}>
        <Form name="login" initialValues={{ remember: true }} onFinish={onFinish}>
          <Form.Item name="email" rules={[{ required: true, message: "Please input your email!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: "Please input your password!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: "100%" }}>
              Log in
            </Button>
            Or <Link to="/register">register now!</Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default LoginPage
