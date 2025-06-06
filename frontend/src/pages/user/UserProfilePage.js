import { useState, useEffect } from "react"
import {
  Form,
  Input,
  Button,
  Card,
  Avatar,
  Upload,
  message,
  Tabs,
  Spin,
  Divider,
  Typography,
} from "antd"
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  UploadOutlined,
  LockOutlined,
} from "@ant-design/icons"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"

const { Title, Paragraph } = Typography
const { TabPane } = Tabs

const UserProfilePage = () => {
  const { currentUser, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState("")
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/users/profile")
      setProfileData(response.data)

      // Set avatar URL if available
      if (response.data.profile?.avatar) {
        setAvatarUrl(response.data.profile.avatar)
      }

      // Set form values
      profileForm.setFieldsValue({
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone || "",
      })
    } catch (error) {
      console.error("Error fetching profile data:", error)
      message.error("Failed to load profile data")
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (values) => {
    try {
      setLoading(true)

      const updatedData = {
        name: values.name,
        phone: values.phone,
        profile: {
          avatar: avatarUrl,
        },
      }

      await updateProfile(updatedData)
      message.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      message.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (values) => {
    try {
      setLoading(true)

      if (values.newPassword !== values.confirmPassword) {
        message.error("New passwords do not match")
        return
      }

      await api.put("/api/users/password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })

      message.success("Password updated successfully")
      passwordForm.resetFields()
    } catch (error) {
      console.error("Error updating password:", error)
      message.error(error.response?.data?.message || "Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (info) => {
    if (info.file.status === "done") {
      setAvatarUrl(info.file.response.url)
      message.success(`${info.file.name} uploaded successfully`)
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} upload failed.`)
    }
  }

  if (loading && !profileData) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Loading profile data...</p>
      </div>
    )
  }

  return (
    <div className="user-profile-page">
      <Title level={2}>My Profile</Title>
      <Paragraph>Manage your personal information and preferences.</Paragraph>

      <Tabs defaultActiveKey="profile">
        <TabPane tab="Profile Information" key="profile">
          <Card>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
              <Avatar size={100} src={avatarUrl} icon={!avatarUrl && <UserOutlined />} />
              <div style={{ marginLeft: 24 }}>
                <Upload
                  name="avatar"
                  action="/api/users/upload-avatar"
                  showUploadList={false}
                  onChange={handleAvatarChange}
                  headers={{
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  }}
                >
                  <Button icon={<UploadOutlined />}>Change Avatar</Button>
                </Upload>
                <p style={{ marginTop: 8, color: "rgba(0, 0, 0, 0.45)" }}>Recommended: 200x200px, JPG or PNG</p>
              </div>
            </div>

            <Divider />

            <Form form={profileForm} layout="vertical" onFinish={handleProfileUpdate}>
              <Form.Item name="name" label="Full Name" rules={[{ required: true, message: "Please enter your name" }]}>
                <Input prefix={<UserOutlined />} placeholder="Your full name" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, message: "Please enter your email" }, { type: "email", message: "Please enter a valid email" }]}
              >
                <Input prefix={<MailOutlined />} disabled />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: "Please enter your phone number" }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Your phone number" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Update Profile
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="Change Password" key="password">
          <Card>
            <Form form={passwordForm} layout="vertical" onFinish={handlePasswordUpdate}>
              <Form.Item
                name="currentPassword"
                label="Current Password"
                rules={[{ required: true, message: "Please enter your current password" }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Current password" />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[{ required: true, message: "Please enter your new password" }, { min: 8, message: "Password must be at least 8 characters" }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="New password" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm New Password"
                rules={[
                  { required: true, message: "Please confirm your new password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error("The two passwords do not match"))
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Update Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default UserProfilePage
