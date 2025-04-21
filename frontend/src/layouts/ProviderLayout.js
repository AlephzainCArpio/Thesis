"use client"

import React, { useState, useEffect } from "react"
import { Layout, Menu, Avatar, Dropdown, Breadcrumb } from "antd"
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  ProfileOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

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
      <Menu.Item key="profile" icon={<ProfileOutlined />}>
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
        <Menu theme="dark" mode="inline" defaultSelectedKeys={[location.pathname]} selectedKeys={[location.pathname]}>
          <Menu.Item key="/provider/dashboard" icon={<DashboardOutlined />}>
            <Link to="/provider/dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="/provider/services" icon={<ProfileOutlined />}>
            <Link to="/provider/services">Manage Services</Link>
          </Menu.Item>
          <Menu.Item key="/provider/pending" icon={<ProfileOutlined />}>
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
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
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
            <Avatar style={{ marginRight: 24, cursor: "pointer" }} icon={<ProfileOutlined />} />
          </Dropdown>
        </Header>
        <Content style={{ margin: "24px 16px", padding: 24, background: "#fff" }}>{children}</Content>
        <Footer style={{ textAlign: "center" }}>© 2025 Organiceee. All rights reserved.</Footer>
      </Layout>
    </Layout>
  )
}

export default ProviderLayout