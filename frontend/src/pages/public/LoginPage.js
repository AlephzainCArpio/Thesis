import { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const user = await login(values.email, values.password);
      
      console.log("Login successful, user data:", user);

      if (!user) {
        console.error("User object is undefined after login.");
        message.error("Login failed.");
        return;
      }

      message.success("Login successful!");

      // Add a small delay to ensure state updates properly
      setTimeout(() => {
        if (user?.role) {
          // Redirect based on role
          if (user.role === "ADMIN") {
            console.log("Redirecting to admin dashboard");
            navigate("/admin");
          } else if (user.role === "PROVIDER") {
            console.log("Redirecting to provider dashboard");
            navigate("/provider");
          } else {
            console.log("Redirecting to user dashboard");
            navigate("/user");
          }
        } else {
          console.error("User role is not defined.");
          message.error("Unexpected error: No role assigned.");
        }
      }, 100);
    } catch (error) {
      console.error("Login error:", error);
      message.error(error.response?.data?.message || error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", paddingTop: 50 }}>
      <Card title="Login" variant="outlined"> 
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
  );
};

export default LoginPage;
