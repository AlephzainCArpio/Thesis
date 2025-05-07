import { useState } from "react"
import { Layout, Menu, Button, Drawer, Avatar, Space, Dropdown } from "antd"
import {
  UserOutlined,
  MenuOutlined,
  LogoutOutlined,
  HomeOutlined,
  LoginOutlined,
  UserAddOutlined,
} from "@ant-design/icons"
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const { Header, Content, Footer } = Layout

const MainLayout = () => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const showMobileMenu = () => {
    setMobileMenuVisible(true)
  }

  const hideMobileMenu = () => {
    setMobileMenuVisible(false)
  }

  const menuItems = [
    {
      key: currentUser ? "/user" : "/",
      label: "Home",
      icon: <HomeOutlined />,
    },
    { key: "/user/venues", label: "Venues", icon: null },
    { key: "/user/catering", label: "Catering", icon: null },
    { key: "/user/photographers", label: "Photographers", icon: null },
    { key: "/user/designers", label: "Designers", icon: null },
  ]

  const mobileMenuItems = currentUser
    ? [
        ...menuItems,
        { key: "/user/profile", label: "Profile", icon: <UserOutlined /> },
        { key: "/user/history", label: "Bookings", icon: null },
        { key: "/user/customize", label: "Customize", icon: null },
        { key: "logout", label: "Logout", icon: <LogoutOutlined /> },
      ]
    : [
        ...menuItems,
        { key: "/login", label: "Login", icon: <LoginOutlined /> },
        { key: "/register", label: "Register", icon: <UserAddOutlined /> },
      ]

  const userMenuItems = [
    {
      key: "/user/profile",
      label: "Profile",
      icon: <UserOutlined />,
    },
    {
      key: "/user/history",
      label: "History",
      icon: null,
    },
    {
      key: "/user/customize",
      label: "Customize",
      icon: null,
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ]

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      handleLogout()
    } else {
      navigate(key)
    }

    if (mobileMenuVisible) {
      hideMobileMenu()
    }
  }

  return (
    <Layout className="layout" style={{ minHeight: "100vh" }}>
      <Header
        style={{
          position: "fixed",
          zIndex: 1,
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="logo" style={{ color: "white", fontSize: "1.5rem", fontWeight: "bold" }}>
          <Link to={currentUser ? "/user" : "/"} style={{ color: "white" }}>
            Organiceee
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="desktop-menu" style={{ display: "flex", alignItems: "center" }}>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ display: "flex", flex: 1 }}
          />

          {currentUser ? (
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleMenuClick }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Space style={{ marginLeft: "16px", cursor: "pointer" }}>
                <Avatar icon={<UserOutlined />} />
                <span style={{ color: "white" }}>{currentUser.name}</span>
              </Space>
            </Dropdown>
          ) : (
            <Space style={{ marginLeft: "16px" }}>
              <Button type="text" onClick={() => navigate("/login")} style={{ color: "white" }}>
                Login
              </Button>
              <Button type="primary" onClick={() => navigate("/register")}>
                Register
              </Button>
            </Space>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          className="mobile-menu-button"
          type="text"
          icon={<MenuOutlined />}
          onClick={showMobileMenu}
          style={{ color: "white", display: "none" }}
        />

        {/* Mobile Menu Drawer */}
        <Drawer
          title="Menu"
          placement="right"
          onClose={hideMobileMenu}
          open={mobileMenuVisible}
          bodyStyle={{ padding: 0 }}
        >
          {currentUser && (
            <div style={{ padding: "16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center" }}>
              <Avatar icon={<UserOutlined />} />
              <span style={{ marginLeft: "8px" }}>{currentUser.name}</span>
            </div>
          )}
          <Menu
            mode="vertical"
            selectedKeys={[location.pathname]}
            items={mobileMenuItems}
            onClick={handleMenuClick}
            style={{ borderRight: 0 }}
          />
        </Drawer>
      </Header>

      <Content style={{ padding: "0 50px", marginTop: 64 }}>
        <div className="site-layout-content" style={{ padding: "24px 0" }}>
          <Outlet />
        </div>
      </Content>

      <Footer style={{ textAlign: "center" }}>Organiceee ©{new Date().getFullYear()} Created with ❤️</Footer>

      {/* CSS for responsive design */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }

          .mobile-menu-button {
            display: block !important;
          }

          .ant-layout-content {
            padding: 0 20px !important;
          }
        }
      `}</style>
    </Layout>
  )
}

export default MainLayout