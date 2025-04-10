"use client"

import { useState, useEffect } from "react"
import { Row, Col, Card, Button, Typography, Statistic, List, Spin, Empty, Tabs, Tag, message } from "antd"
import {
  HomeOutlined,
  ShopOutlined,
  CameraOutlined,
  BgColorsOutlined,
  HeartOutlined,
  HistoryOutlined,
  CalendarOutlined,
  RightOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons"
import { Link } from "react-router-dom"
import api from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"

const { Title, Paragraph } = Typography
const { TabPane } = Tabs

const UserDashboard = () => {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    recentViews: [],
    favorites: [],
    recommendations: [],
    stats: {
      totalViews: 0,
      totalFavorites: 0,
      totalInquiries: 0,
    },
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await api.get("/users/dashboard")
      setDashboardData(response.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      message.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const getServiceIcon = (type) => {
    switch (type) {
      case "venue":
        return <HomeOutlined style={{ color: "#1890ff" }} />
      case "catering":
        return <ShopOutlined style={{ color: "#fa8c16" }} />
      case "photographer":
        return <CameraOutlined style={{ color: "#color: '#fa8c16" }} />
      case "photographer":
        return <CameraOutlined style={{ color: "#52c41a" }} />
      case "designer":
        return <BgColorsOutlined style={{ color: "#722ed1" }} />
      default:
        return <HomeOutlined />
    }
  }

  const getServiceTypeText = (type) => {
    switch (type) {
      case "venue":
        return "Venue"
      case "catering":
        return "Catering"
      case "photographer":
        return "Photographer"
      case "designer":
        return "Designer"
      default:
        return type
    }
  }

  const getServiceUrl = (type, id) => {
    switch (type) {
      case "venue":
        return `/user/venues/${id}`
      case "catering":
        return `/user/catering/${id}`
      case "photographer":
        return `/user/photographers/${id}`
      case "designer":
        return `/user/designers/${id}`
      default:
        return "#"
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="user-dashboard">
      <Title level={2}>Welcome, {currentUser?.name || "User"}!</Title>
      <Paragraph>Here's an overview of your activity and recommendations.</Paragraph>

      {/* Stats Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Services Viewed"
              value={dashboardData.stats.totalViews}
              prefix={<HistoryOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Favorites"
              value={dashboardData.stats.totalFavorites}
              prefix={<HeartOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Inquiries Sent"
              value={dashboardData.stats.totalInquiries}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Tabs defaultActiveKey="recent">
        <TabPane tab="Recently Viewed" key="recent">
          {dashboardData.recentViews.length > 0 ? (
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
              dataSource={dashboardData.recentViews}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    hoverable
                    cover={
                      <img
                        alt={item.name}
                        src={item.image || "https://via.placeholder.com/300x150"}
                        style={{ height: 150, objectFit: "cover" }}
                      />
                    }
                  >
                    <Card.Meta
                      avatar={getServiceIcon(item.type)}
                      title={item.name}
                      description={
                        <>
                          <Tag color="blue">{getServiceTypeText(item.type)}</Tag>
                          <div style={{ marginTop: 8 }}>
                            <EnvironmentOutlined /> {item.location}
                          </div>
                          <div style={{ marginTop: 8 }}>Viewed on {new Date(item.viewedAt).toLocaleDateString()}</div>
                        </>
                      }
                    />
                    <Button
                      type="link"
                      style={{ padding: 0, marginTop: 8 }}
                      as={Link}
                      to={getServiceUrl(item.type, item.id)}
                    >
                      View Details <RightOutlined />
                    </Button>
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <Empty description="You haven't viewed any services yet" />
          )}
        </TabPane>

        <TabPane tab="Favorites" key="favorites">
          {dashboardData.favorites.length > 0 ? (
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
              dataSource={dashboardData.favorites}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    hoverable
                    cover={
                      <img
                        alt={item.name}
                        src={item.image || "https://via.placeholder.com/300x150"}
                        style={{ height: 150, objectFit: "cover" }}
                      />
                    }
                  >
                    <Card.Meta
                      avatar={getServiceIcon(item.type)}
                      title={item.name}
                      description={
                        <>
                          <Tag color="blue">{getServiceTypeText(item.type)}</Tag>
                          <div style={{ marginTop: 8 }}>
                            <EnvironmentOutlined /> {item.location}
                          </div>
                        </>
                      }
                    />
                    <Button
                      type="link"
                      style={{ padding: 0, marginTop: 8 }}
                      as={Link}
                      to={getServiceUrl(item.type, item.id)}
                    >
                      View Details <RightOutlined />
                    </Button>
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <Empty description="You haven't added any favorites yet" />
          )}
        </TabPane>

        <TabPane tab="Recommended for You" key="recommendations">
          {dashboardData.recommendations.length > 0 ? (
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
              dataSource={dashboardData.recommendations}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    hoverable
                    cover={
                      <img
                        alt={item.name}
                        src={item.image || "https://via.placeholder.com/300x150"}
                        style={{ height: 150, objectFit: "cover" }}
                      />
                    }
                  >
                    <Card.Meta
                      avatar={getServiceIcon(item.type)}
                      title={item.name}
                      description={
                        <>
                          <Tag color="blue">{getServiceTypeText(item.type)}</Tag>
                          <div style={{ marginTop: 8 }}>
                            <EnvironmentOutlined /> {item.location}
                          </div>
                        </>
                      }
                    />
                    <Button
                      type="link"
                      style={{ padding: 0, marginTop: 8 }}
                      as={Link}
                      to={getServiceUrl(item.type, item.id)}
                    >
                      View Details <RightOutlined />
                    </Button>
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <Empty description="No recommendations available yet. Browse more services to get personalized recommendations." />
          )}
        </TabPane>
      </Tabs>

      {/* Quick Links */}
      <Card title="Quick Links" style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Button type="primary" icon={<HomeOutlined />} block as={Link} to="/user/venues">
              Browse Venues
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button type="primary" icon={<ShopOutlined />} block as={Link} to="/user/catering">
              Browse Catering
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button type="primary" icon={<CameraOutlined />} block as={Link} to="/user/photographers">
              Browse Photographers
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button type="primary" icon={<BgColorsOutlined />} block as={Link} to="/user/designers">
              Browse Designers
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default UserDashboard
