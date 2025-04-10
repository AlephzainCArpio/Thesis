"use client"

import React, { useState, useEffect } from "react"
import { Layout, Menu, Avatar, Dropdown, Badge, Breadcrumb, Button, notification } from "antd"
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  ProfileOutlined,
  CalendarOutlined,
  MessageOutlined,
  LogoutOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import logo from "../assets/index.js"

const { Header, Sider, Content, Footer } = Layout

const ProviderLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [breadcrumbs, setBreadcrumbs] = useState([])
  const { currentUser, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Generate breadcrumbs based on current location
    const pathSnippets = location.pathname.split("/").filter((i) => i)
    const breadcrumbItems = []

    let url = ""
    pathSnippets.forEach((path, index) => {
      url += `/${path}`

      // Format the path for display (capitalize first letter, replace hyphens with spaces)
      const formattedPath = path
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

      breadcrumbItems.push({
        key: url,
        title: index === 0 ? "Provider" : formattedPath,
        path: url,
      })
    })

    setBreadcrumbs(breadcrumbItems)

    // Fetch notifications
    fetchNotifications()
  }, [location])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await api.get("/provider/notifications")
      setNotifications(response.data)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
      notification.error({
        message: "Error",
        description: "Failed to load notifications. Please try again later.",
      })
    } finally {
      setLoading(false)
    }
  }

  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.put(`/provider/notifications/${notificationId}/read`)
      // Update the local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification,
        ),
      )
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      // Your logout function in AuthContext should handle removing the token
      navigate("/login")
    } catch (error) {
      console.error("Failed to logout:", error)
      notification.error({
        message: "Logout Failed",
        description: "Please try again later.",
      })
    }
  }

  const notificationMenu = (
    <Menu>
      <Menu.Item key="notifications-header" disabled>
        <strong>Notifications</strong>
      </Menu.Item>
      <Menu.Divider />
      {loading ? (
        <Menu.Item key="loading" disabled>
          Loading notifications...
        </Menu.Item>
      ) : notifications.length > 0 ? (
        notifications.map((notification) => (
          <Menu.Item
            key={notification.id}
            style={{ backgroundColor: notification.read ? "white" : "#f0f7ff" }}
            onClick={() => markNotificationAsRead(notification.id)}
          >
            <div>
              <div>{notification.message}</div>
              <small style={{ color: "#8c8c8c" }}>{new Date(notification.createdAt).toLocaleString()}</small>
            </div>
          </Menu.Item>
        ))
      ) : (
        <Menu.Item key="no-notifications" disabled>
          No notifications
        </Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item key="all-notifications">
        <Link to="/provider/notifications">View all notifications</Link>
      </Menu.Item>
    </Menu>
  )

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/provider/profile">My Profile</Link>
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        <Link to="/provider/settings">Settings</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  )

  const unreadNotifications = notifications.filter((n) => !n.read).length

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={256}>
        <div
          className="logo"
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "0" : "0 24px",
          }}
        >
          <img
            src={logo || "/placeholder.svg"}
            alt="Logo"
            style={{
              height: "32px",
              maxWidth: "100%",
            }}
          />
          {!collapsed && <h1 style={{ color: "white", margin: "0 0 0 12px", fontSize: "18px" }}>EventPro</h1>}
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={[location.pathname]} selectedKeys={[location.pathname]}>
          <Menu.Item key="/provider/dashboard" icon={<DashboardOutlined />}>
            <Link to="/provider/dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="/provider/register-service" icon={<PlusOutlined />}>
            <Link to="/provider/register-service">Add Service</Link>
          </Menu.Item>
          <Menu.Item key="/provider/services" icon={<ProfileOutlined />}>
            <Link to="/provider/services">Manage Services</Link>
          </Menu.Item>
          <Menu.Item key="/provider/pending" icon={<ClockCircleOutlined />}>
            <Link to="/provider/pending">Pending Services</Link>
          </Menu.Item>
          <Menu.Item key="/provider/bookings" icon={<CalendarOutlined />}>
            <Link to="/provider/bookings">Bookings</Link>
          </Menu.Item>
          <Menu.Item key="/provider/messages" icon={<MessageOutlined />}>
            <Link to="/provider/messages">Messages</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header
          style={{
            padding: 0,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0, 21, 41, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: "trigger",
              onClick: () => setCollapsed(!collapsed),
              style: { fontSize: "18px", padding: "0 24px", cursor: "pointer" },
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", marginRight: "24px" }}>
            <Dropdown overlay={notificationMenu} placement="bottomRight" trigger={["click"]}>
              <Badge count={unreadNotifications} overflowCount={99}>
                <Button type="text" icon={<BellOutlined style={{ fontSize: "18px" }} />} />
              </Badge>
            </Dropdown>
            <Dropdown overlay={userMenu} placement="bottomRight" trigger={["click"]}>
              <div style={{ cursor: "pointer", display: "flex", alignItems: "center", marginLeft: "16px" }}>
                <Avatar src={currentUser?.avatar} icon={!currentUser?.avatar && <UserOutlined />} />
                <span style={{ marginLeft: "8px" }}>{currentUser?.name || "Provider"}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: "16px" }}>
          <div style={{ padding: "16px", background: "#fff", minHeight: "100%" }}>
            {breadcrumbs.length > 0 && (
              <Breadcrumb style={{ marginBottom: "16px" }}>
                <Breadcrumb.Item key="home">
                  <Link to="/provider/dashboard">Home</Link>
                </Breadcrumb.Item>
                {breadcrumbs.map((item, index) => (
                  <Breadcrumb.Item key={item.key}>
                    {index === breadcrumbs.length - 1 ? item.title : <Link to={item.path}>{item.title}</Link>}
                  </Breadcrumb.Item>
                ))}
              </Breadcrumb>
            )}
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: "center", padding: "12px 50px" }}>
          Organiceee ©{new Date().getFullYear()} - Provider Portal
        </Footer>
      </Layout>
    </Layout>
  )
}

export default ProviderLayout
