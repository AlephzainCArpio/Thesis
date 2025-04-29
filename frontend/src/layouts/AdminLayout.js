import { useState, useEffect } from "react"
import { Layout, Menu, Button, Avatar, Dropdown, Badge } from "antd"
import {
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  BankOutlined,
  CoffeeOutlined,
  CameraOutlined,
  BgColorsOutlined,
  AuditOutlined,
} from "@ant-design/icons"
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api" 

const { Header, Content, Footer, Sider } = Layout

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [pendingCount] = useState(0)

   const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  )

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo" style={{ height: 32, margin: 16, background: "rgba(255, 255, 255, 0.3)" }} />
        <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline" selectedKeys={[location.pathname]}>
          <Menu.Item key="/admin" icon={<DashboardOutlined />}>
            <Link to="/admin">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="/admin/provider-management" icon={<AuditOutlined />}>
            <Link to="/admin/provider-management">Provider Management</Link>
            {/* Use Badge to show pending count */}
            {pendingCount > 0 && (
              <Badge count={pendingCount} style={{ marginLeft: '10px', backgroundColor: '#52c41a' }} />
            )}
          </Menu.Item>
          <Menu.Item key="/admin/venues" icon={<BankOutlined />}>
            <Link to="/admin/venues">Venues</Link>
          </Menu.Item>
          <Menu.Item key="/admin/catering" icon={<CoffeeOutlined />}>
            <Link to="/admin/catering">Catering</Link>
          </Menu.Item>
          <Menu.Item key="/admin/photographers" icon={<CameraOutlined />}>
            <Link to="/admin/photographers">Photographers</Link>
          </Menu.Item>
          <Menu.Item key="/admin/designers" icon={<BgColorsOutlined />}>
            <Link to="/admin/designers">Event Designers</Link>
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout className="site-layout">
        <Header style={{ padding: 0, background: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: 16 }}>
            <div style={{ marginLeft: 16 }}>
              <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
            </div>
            <div>
              <Dropdown overlay={userMenu} placement="bottomRight">
                <Button type="link">
                  <Avatar icon={<UserOutlined />} /> {currentUser?.name || "Admin"}
                </Button>
              </Dropdown>
            </div>
          </div>
        </Header>

        <Content style={{ margin: "16px" }}>
          <div style={{ padding: 24, minHeight: 360, background: "#fff" }}>
            <Outlet />
          </div>
        </Content>

        <Footer style={{ textAlign: "center" }}>Organiceee - Admin Panel ©{new Date().getFullYear()}</Footer>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
