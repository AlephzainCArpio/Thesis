"use client"

import { useState } from "react"
import { Form, Input, Button, Card, Radio, message, Upload } from "antd"
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, UploadOutlined } from "@ant-design/icons"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import api from "../../services/api"

const RegisterPage = () => {
  const [loading, setLoading] = useState(false)
  const [userRole, setUserRole] = useState("USER")
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const onFinish = async (values) => {
    try {
      setLoading(true)

      if (values.password !== values.confirmPassword) {
        message.error("Passwords do not match!")
        return
      }

      const formData = new FormData()
      formData.append("name", values.name)
      formData.append("email", values.email)
      formData.append("password", values.password)
      formData.append("phone", values.phone)
      formData.append("role", values.role)

      if (values.role === "PROVIDER" && values.verificationDocument?.[0]) {
        formData.append("verificationDocument", values.verificationDocument[0].originFileObj)
      }

      const response = await axios.post(
        `${api.defaults.baseURL}/auth/register`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )

      const user = response.data
      localStorage.setItem("token", user.token)
      api.defaults.headers.common["Authorization"] = `Bearer ${user.token}`

      message.success(`Welcome, ${user.name}!`)

      if (user.role === "ADMIN") {
        navigate("/admin")
      } else if (user.role === "PROVIDER") {
        if (user.providerStatus === "PENDING") {
          message.info("Your provider account is pending approval. Some features will be limited until approved.")
        }
        navigate("/provider")
      } else {
        navigate("/user")
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to register")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", paddingTop: 50 }}>
      <Card title="Register" bordered={false}>
        <Form
          name="register"
          form={form}
          initialValues={{ role: "USER" }}
          onFinish={onFinish}
          onValuesChange={(changedValues) => {
            if (changedValues.role) {
              setUserRole(changedValues.role)
            }
          }}
        >
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

          {userRole === "PROVIDER" && (
            <Form.Item
              name="verificationDocument"
              label="Business Verification Document"
              valuePropName="fileList"
              getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
              rules={[{ required: true, message: "Please upload a verification document!" }]}
            >
              <Upload
                name="verificationDocument"
                listType="picture"
                maxCount={1}
                beforeUpload={() => false} // Prevent auto upload
              >
                <Button icon={<UploadOutlined />}>Click to upload</Button>
              </Upload>
            </Form.Item>
          )}

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
