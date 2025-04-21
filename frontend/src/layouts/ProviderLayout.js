"use client"

import React, { useState, useEffect } from "react"
import { Layout, Menu, Avatar, Dropdown, Breadcrumb } from "antd"
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  ClockCircleOutlined,
  ProfileOutlined,
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import logo from "../assets/index.js"

const { Header, Sider, Content, Footer } = Layout

const ProviderLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [breadcrumbs, setBreadcrumbs] = useState([])
  const { logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const pathSnippets = location.pathname.split("/").filter((i) => i)
    const breadcrumbItems = []

    let url = ""
    pathSnippets.forEach((path, index) => {
      url += `/${path}`
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
  }, [location])

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Failed to logout:", error)
    }
  }

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
          {!collapsed && <h1 style={{ color: "white", margin: "0 0 0 12px", fontSize: "18px" }}>Organiceee</h1>}
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={[location.pathname]} selectedKeys={[location.pathname]}>
          <Menu.Item key="/provider/dashboard" icon={<DashboardOutlined />}>
            <Link to="/provider/dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="/provider/services" icon={<ProfileOutlined />}>
            <Link to="/provider/services">Manage Services</Link>
          </Menu.Item>
          <Menu.Item key="/provider/pending" icon={<ClockCircleOutlined />}>
            <Link to="/provider/pending">Pending Services</Link>
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
              style: {
                padding: "0 24px",
                fontSize: "18px",
                cursor: "pointer",
              },
            })}
            <Breadcrumb style={{ marginLeft: 24 }}>
              {breadcrumbs.map((breadcrumb) => (
                <Breadcrumb.Item key={breadcrumb.key}>
                  <Link to={breadcrumb.path}>{breadcrumb.title}</Link>
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          </div>
          <Dropdown overlay={userMenu} placement="bottomRight">
            <Avatar style={{ marginRight: 24, cursor: "pointer" }} icon={<UserOutlined />} />
          </Dropdown>
        </Header>
        <Content style={{ margin: "24px 16px", padding: 24, background: "#fff" }}>{children}</Content>
        <Footer style={{ textAlign: "center" }}>© 2025 Organiceee. All rights reserved.</Footer>
      </Layout>
    </Layout>
  )
}

export default ProviderLayout
