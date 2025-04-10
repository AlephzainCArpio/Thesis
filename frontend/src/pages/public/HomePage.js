"use client"

import { useState, useEffect } from "react"
import { Row, Col, Card, Button, Carousel, Typography, Space, Statistic } from "antd"
import {
  HomeOutlined,
  ShopOutlined,
  CameraOutlined,
  BgColorsOutlined,
  ArrowRightOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons"
import { Link } from "react-router-dom"
import api from "../../services/api"

const { Title, Paragraph } = Typography

const HomePage = () => {
  const [stats, setStats] = useState({
    venues: 0,
    caterings: 0,
    photographers: 0,
    designers: 0,
    users: 0,
    providers: 0,
    events: 0,
  })
  const [featuredServices, setFeaturedServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch statistics
        const statsResponse = await api.get("/public/stats")
        setStats(statsResponse.data)

        // Fetch featured services
        const featuredResponse = await api.get("/public/featured")
        setFeaturedServices(featuredResponse.data)
      } catch (error) {
        console.error("Error fetching homepage data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div
        className="hero-section"
        style={{
          padding: "60px 0",
          background: "linear-gradient(135deg, #1a365d 0%, #2a4365 100%)",
          color: "white",
          textAlign: "center",
        }}
      >
        <Row justify="center" align="middle">
          <Col xs={24} md={16}>
            <Title style={{ color: "white", fontSize: "2.5rem" }}>Plan Your Perfect Event with Organiceee</Title>
            <Paragraph style={{ color: "white", fontSize: "1.2rem", marginBottom: "2rem" }}>
              Find the best venues, catering services, photographers, and event designers all in one place.
            </Paragraph>
            <Space size="large">
              <Button type="primary" size="large" as={Link} to="/register">
                Get Started
              </Button>
              <Button size="large" ghost as={Link} to="/user/customize">
                Explore Services
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Services Section */}
      <div style={{ padding: "60px 20px", background: "#f7fafc" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "40px" }}>
          Our Services
        </Title>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{ textAlign: "center", height: "100%" }}
              cover={<HomeOutlined style={{ fontSize: "48px", margin: "24px 0", color: "#4299e1" }} />}
            >
              <Card.Meta
                title="Venues"
                description="Find the perfect location for your event, from intimate spaces to grand ballrooms."
              />
              <Button type="link" style={{ marginTop: "16px" }}>
                Browse Venues <ArrowRightOutlined />
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{ textAlign: "center", height: "100%" }}
              cover={<ShopOutlined style={{ fontSize: "48px", margin: "24px 0", color: "#ed8936" }} />}
            >
              <Card.Meta
                title="Catering"
                description="Discover delicious menu options from top-rated catering services in Bulan."
              />
              <Button type="link" style={{ marginTop: "16px" }}>
                Browse Catering <ArrowRightOutlined />
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{ textAlign: "center", height: "100%" }}
              cover={<CameraOutlined style={{ fontSize: "48px", margin: "24px 0", color: "#38b2ac" }} />}
            >
              <Card.Meta
                title="Photographers"
                description="Capture your special moments with professional photographers for any occasion."
              />
              <Button type="link" style={{ marginTop: "16px" }}>
                Browse Photographers <ArrowRightOutlined />
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{ textAlign: "center", height: "100%" }}
              cover={<BgColorsOutlined style={{ fontSize: "48px", margin: "24px 0", color: "#9f7aea" }} />}
            >
              <Card.Meta
                title="Event Designers"
                description="Transform your event space with creative designers who bring your vision to life."
              />
              <Button type="link" style={{ marginTop: "16px" }}>
                Browse Designers <ArrowRightOutlined />
              </Button>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Featured Services */}
      <div style={{ padding: "60px 20px" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "40px" }}>
          Featured Services
        </Title>
        <Carousel autoplay>
          {featuredServices.map((service) => (
            <div key={service.id}>
              <Row justify="center" align="middle" gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <img
                    src={service.image || "https://via.placeholder.com/600x400"}
                    alt={service.name}
                    style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                  />
                </Col>
                <Col xs={24} md={12}>
                  <Title level={3}>{service.name}</Title>
                  <Paragraph>{service.description}</Paragraph>
                  <Paragraph>
                    <strong>Location:</strong> {service.location}
                  </Paragraph>
                  <Button type="primary">View Details</Button>
                </Col>
              </Row>
            </div>
          ))}
        </Carousel>
      </div>

      {/* Statistics */}
      <div style={{ padding: "60px 20px", background: "#f7fafc" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "40px" }}>
          Why Choose Us
        </Title>
        <Row gutter={[48, 48]} justify="center">
          <Col xs={12} md={6}>
            <Statistic
              title="Venues"
              value={stats.venues}
              prefix={<HomeOutlined />}
              valueStyle={{ color: "#4299e1" }}
            />
          </Col>
          <Col xs={12} md={6}>
            <Statistic
              title="Caterers"
              value={stats.caterings}
              prefix={<ShopOutlined />}
              valueStyle={{ color: "#ed8936" }}
            />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title="Users" value={stats.users} prefix={<UserOutlined />} valueStyle={{ color: "#38b2ac" }} />
          </Col>
          <Col xs={12} md={6}>
            <Statistic
              title="Providers"
              value={stats.providers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#9f7aea" }}
            />
          </Col>
        </Row>
      </div>

      <div style={{ padding: "60px 20px" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "40px" }}>
          How It Works
        </Title>
        <Row gutter={[24, 48]} justify="center">
          <Col xs={24} md={8}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  lineHeight: "80px",
                  borderRadius: "50%",
                  background: "#4299e1",
                  color: "white",
                  fontSize: "36px",
                  margin: "0 auto 24px",
                }}
              >
                1
              </div>
              <Title level={4}>Create an Account</Title>
              <Paragraph>Sign up as a user to browse services or as a provider to list your services.</Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  lineHeight: "80px",
                  borderRadius: "50%",
                  background: "#ed8936",
                  color: "white",
                  fontSize: "36px",
                  margin: "0 auto 24px",
                }}
              >
                2
              </div>
              <Title level={4}>Find Services</Title>
              <Paragraph>
                Browse through our extensive catalog of venues, caterers, photographers, and designers.
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  lineHeight: "80px",
                  borderRadius: "50%",
                  background: "#38b2ac",
                  color: "white",
                  fontSize: "36px",
                  margin: "0 auto 24px",
                }}
              >
                3
              </div>
              <Title level={4}>Book and Enjoy</Title>
              <Paragraph>
                Contact service providers, make arrangements, and enjoy your perfectly planned event.
              </Paragraph>
            </div>
          </Col>
        </Row>
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <Button type="primary" size="large" as={Link} to="/register">
            Get Started Now
          </Button>
        </div>
      </div>

{/* Testimonials */}
      <div style={{ padding: "60px 20px", background: "#f7fafc" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "40px" }}>
          What Our Users Say
        </Title>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} md={8}>
            <Card>
              <Paragraph style={{ fontSize: "16px" }}>
                "   "
              </Paragraph>
              <div style={{ marginTop: "16px" }}>
                <strong>    </strong>
                <div>       </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Paragraph style={{ fontSize: "16px" }}>
                "       "
              </Paragraph>
              <div style={{ marginTop: "16px" }}>
                <strong>Juan Dela Cruz</strong>
                <div>Professional Photographer</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Paragraph style={{ fontSize: "16px" }}>
                "        "
              </Paragraph>
              <div style={{ marginTop: "16px" }}>
                <strong>Anna Reyes</strong>
                <div>Event Coordinator</div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* CTA Section */}
      <div
        style={{
          padding: "80px 20px",
          background: "linear-gradient(135deg, #1a365d 0%, #2a4365 100%)",
          color: "white",
          textAlign: "center",
        }}
      >
        <Title level={2} style={{ color: "white" }}>
          Ready to Plan Your Next Event?
        </Title>
        <Paragraph style={{ color: "white", fontSize: "1.2rem", marginBottom: "2rem" }}>
          Join the Organiceee for smooth and budget-friendly event planning.    
        </Paragraph>
        <Space size="large">
          <Button type="primary" size="large" as={Link} to="/register">
            Sign Up Now
          </Button>
          <Button ghost size="large" as={Link} to="/user/customize">
            Browse Services
          </Button>
        </Space>
      </div>
    </div>
  )
}

export default HomePage
