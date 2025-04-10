"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, Row, Col, Typography, Button, Descriptions, Tag, Image, Spin, notification, Divider, Rate } from "antd"
import { DollarOutlined, EnvironmentOutlined, CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons"
import api from "../../services/api"

const { Title, Text, Paragraph } = Typography

const DesignerDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [designer, setDesigner] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDesigner = async () => {
      try {
        const response = await api.get(`/designers/${id}`)
        setDesigner(response.data)
      } catch (error) {
        notification.error({
          message: "Error",
          description: "Failed to load designer details.",
        })
        console.error("Error fetching designer:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDesigner()
  }, [id])

  const handleBooking = () => {
    // Implement booking functionality
    notification.success({
      message: "Booking Initiated",
      description: `You've started booking ${designer.name}. Complete your event details to confirm.`,
    })
    // Navigate to booking page or open modal
    // navigate('/booking', { state: { service: designer, type: 'designer' } })
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!designer) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Title level={3}>Designer not found</Title>
        <Button type="primary" onClick={() => navigate("/designers")}>
          Back to Designers
        </Button>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card bordered={false} style={{ marginBottom: 24 }}>
            <Title level={2}>{designer.name}</Title>
            <div style={{ marginBottom: 16 }}>
              <Rate disabled defaultValue={designer.rating || 4.5} allowHalf />
              <Text type="secondary" style={{ marginLeft: 8 }}>
                {designer.rating || 4.5}/5
              </Text>
            </div>

            <Paragraph style={{ fontSize: 16 }}>
              <EnvironmentOutlined style={{ marginRight: 8 }} />
              {designer.location}
            </Paragraph>

            <Divider />

            <Title level={4}>About the Designer</Title>
            <Paragraph>{designer.description}</Paragraph>

            <Divider />

            <Title level={4}>Portfolio</Title>
            <div style={{ marginBottom: 24 }}>
              {designer.images && designer.images.length > 0 ? (
                <Image.PreviewGroup>
                  <Row gutter={[16, 16]}>
                    {designer.images.map((image, index) => (
                      <Col xs={12} sm={8} md={6} key={index}>
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Portfolio ${index + 1}`}
                          style={{ objectFit: "cover", height: 150 }}
                        />
                      </Col>
                    ))}
                  </Row>
                </Image.PreviewGroup>
              ) : (
                <Text type="secondary">No portfolio images available</Text>
              )}
            </div>

            <Divider />

            <Title level={4}>Design Specialties</Title>
            <div style={{ marginBottom: 16 }}>
              {designer.eventTypes &&
                designer.eventTypes.map((type) => (
                  <Tag color="blue" key={type} style={{ marginBottom: 8 }}>
                    {type}
                  </Tag>
                ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Booking Information" bordered={false} style={{ marginBottom: 24 }}>
            <Descriptions column={1} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Price">
                <Text strong style={{ fontSize: 18 }}>
                  <DollarOutlined /> ${designer.price}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Experience">{designer.experience || "5+ years"}</Descriptions.Item>

              <Descriptions.Item label="Design Style">
                {designer.style || "Contemporary, Elegant, Minimalist"}
              </Descriptions.Item>

              <Descriptions.Item label="Services">
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  {(
                    designer.services || [
                      "Event theme design",
                      "Decor planning",
                      "Floral arrangements",
                      "Lighting design",
                    ]
                  ).map((service, index) => (
                    <li key={index}>
                      <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                      {service}
                    </li>
                  ))}
                </ul>
              </Descriptions.Item>
            </Descriptions>

            <Button type="primary" size="large" block icon={<CalendarOutlined />} onClick={handleBooking}>
              Book Now
            </Button>

            <Button style={{ marginTop: 16 }} block onClick={() => navigate("/designers")}>
              Back to Designers
            </Button>
          </Card>

          <Card title="Contact Information" bordered={false}>
            <Descriptions column={1}>
              <Descriptions.Item label="Email">{designer.email || "contact@example.com"}</Descriptions.Item>
              <Descriptions.Item label="Phone">{designer.phone || "(123) 456-7890"}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DesignerDetailPage
