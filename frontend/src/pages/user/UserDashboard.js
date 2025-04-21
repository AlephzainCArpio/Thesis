"use client"

import { useState, useEffect } from "react"
import { Row, Col, Card, Button, Typography, Statistic, List, Spin, Empty, Tabs, Tag, message, Popover } from "antd"
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
  InfoCircleOutlined,
  StarOutlined,
  DollarOutlined,
  TeamOutlined,
} from "@ant-design/icons"
import { Link } from "react-router-dom"
import api from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import ServiceCard from '../../components/common/ServiceCard';
const { Title, Paragraph, Text } = Typography
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

  // Detailed content for hover popover
  const getDetailedContent = (item) => (
    <div style={{ maxWidth: 300 }}>
      <div style={{ marginBottom: 8 }}>
        <Text strong>{item.name}</Text>
      </div>
      <div style={{ marginBottom: 8 }}>
        <EnvironmentOutlined /> {item.location}
      </div>
      {item.rating && (
        <div style={{ marginBottom: 8 }}>
          <StarOutlined style={{ color: "#faad14" }} /> {item.rating} ({item.reviewCount || 0} reviews)
        </div>
      )}
      {item.price && (
        <div style={{ marginBottom: 8 }}>
          <DollarOutlined /> Starting from {item.price}
        </div>
      )}
      {item.capacity && (
        <div style={{ marginBottom: 8 }}>
          <TeamOutlined /> Capacity: {item.capacity} guests
        </div>
      )}
      {item.description && (
        <div style={{ marginBottom: 8 }}>
          <Text type="secondary">{item.description.substring(0, 150)}...</Text>
        </div>
      )}
      <div style={{ marginTop: 12 }}>
        <Link to={getServiceUrl(item.type, item.id)}>View full details</Link>
      </div>
    </div>
  )

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
                  <Popover
                    content={getDetailedContent(item)}
                    title={`${getServiceTypeText(item.type)} Details`}
                    placement="right"
                    trigger="hover"
                  >
                    <Card
                      hoverable
                      cover={
                        <div style={{ position: "relative" }}>
                          <img
                            alt={item.name}
                            src={
                              `${process.env.REACT_APP_API_URL}/uploads/${item.image}` ||
                              "https://via.placeholder.com/300x150"
                            }
                            style={{ height: 150, objectFit: "cover" }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                              padding: "30px 10px 10px",
                            }}
                          >
                            <Text style={{ color: "white", fontWeight: "bold" }}>{item.name}</Text>
                          </div>
                        </div>
                      }
                    >
                      <Card.Meta
                        avatar={getServiceIcon(item.type)}
                        title={
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            {item.name}
                            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
                          </div>
                        }
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
                  </Popover>
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
                  <Popover
                    content={getDetailedContent(item)}
                    title={`${getServiceTypeText(item.type)} Details`}
                    placement="right"
                    trigger="hover"
                  >
                    <Card
                      hoverable
                      cover={
                        <div style={{ position: "relative" }}>
                          <img
                            alt={item.name}
                            src={
                              `${process.env.REACT_APP_API_URL}/uploads/${item.image}` ||
                              "https://via.placeholder.com/300x150"
                            }
                            style={{ height: 150, objectFit: "cover" }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                              padding: "30px 10px 10px",
                            }}
                          >
                            <Text style={{ color: "white", fontWeight: "bold" }}>{item.name}</Text>
                          </div>
                        </div>
                      }
                    >
                      <Card.Meta
                        avatar={getServiceIcon(item.type)}
                        title={
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            {item.name}
                            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
                          </div>
                        }
                        description={
                          <>
                            <Tag color="blue">{getServiceTypeText(item.type)}</Tag>
                            <div style={{ marginTop: 8 }}>
                              <EnvironmentOutlined /> {item.location}
                            </div>
                            {item.rating && (
                              <div style={{ marginTop: 4 }}>
                                {Array(Math.floor(item.rating))
                                  .fill()
                                  .map((_, i) => (
                                    <StarOutlined key={i} style={{ color: "#faad14" }} />
                                  ))}
                                {Array(5 - Math.floor(item.rating))
                                  .fill()
                                  .map((_, i) => (
                                    <StarOutlined key={i} style={{ color: "#d9d9d9" }} />
                                  ))}
                              </div>
                            )}
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
                  </Popover>
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
                  <Popover
                    content={getDetailedContent(item)}
                    title={`${getServiceTypeText(item.type)} Details`}
                    placement="right"
                    trigger="hover"
                  >
                    <Card
                      hoverable
                      cover={
                        <div style={{ position: "relative" }}>
                          <img
                            alt={item.name}
                            src={
                              `${process.env.REACT_APP_API_URL}/uploads/${item.image}` ||
                              "https://via.placeholder.com/300x150"
                            }
                            style={{ height: 150, objectFit: "cover" }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                              padding: "30px 10px 10px",
                            }}
                          >
                            <Text style={{ color: "white", fontWeight: "bold" }}>{item.name}</Text>
                          </div>
                        </div>
                      }
                    >
                      <Card.Meta
                        avatar={getServiceIcon(item.type)}
                        title={
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            {item.name}
                            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
                          </div>
                        }
                        description={
                          <>
                            <Tag color="blue">{getServiceTypeText(item.type)}</Tag>
                            <div style={{ marginTop: 8 }}>
                              <EnvironmentOutlined /> {item.location}
                            </div>
                            {item.rating && (
                              <div style={{ marginTop: 4 }}>
                                {Array(Math.floor(item.rating))
                                  .fill()
                                  .map((_, i) => (
                                    <StarOutlined key={i} style={{ color: "#faad14" }} />
                                  ))}
                                {Array(5 - Math.floor(item.rating))
                                  .fill()
                                  .map((_, i) => (
                                    <StarOutlined key={i} style={{ color: "#d9d9d9" }} />
                                  ))}
                              </div>
                            )}
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
                  </Popover>
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
