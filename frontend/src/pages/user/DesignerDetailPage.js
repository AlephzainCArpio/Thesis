import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, Row, Col, Typography, Descriptions, Tag, Image, Spin, Divider, Button } from "antd"
import { EnvironmentOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons"
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
        const response = await api.get(`/api/designers/${id}`)
        console.log("API Response for Designer:", response.data) // Debugging log
        setDesigner(response.data)
      } catch (error) {
        console.error("Error fetching designer:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDesigner()
  }, [id])

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!designer) {
    return null
  }

  let portfolioImages = []
  let eventTypes = []
  
  // Handle portfolio JSON
  try {
    portfolioImages = designer.portfolio ? JSON.parse(designer.portfolio) : []
  } catch (error) {
    console.error(`Error parsing portfolio JSON for designer ${designer.name}:`, error)
  }

  // Handle eventTypes JSON
  try {
    eventTypes = designer.eventTypes ? JSON.parse(designer.eventTypes) : []
  } catch (error) {
    console.error(`Error parsing eventTypes JSON for designer ${designer.name}:`, error)
  }

  // Debugging logs
  console.log("Event Types:", eventTypes)

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card bordered={false} style={{ marginBottom: 24 }}>
            <Title level={2}>{designer.name}</Title>

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
              {portfolioImages.length > 0 ? (
                <Image.PreviewGroup>
                  <Row gutter={[16, 16]}>
                    {portfolioImages.map((image, index) => (
                      <Col xs={12} sm={8} md={6} key={index}>
                        <Image
                          src={image}
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

            <Descriptions title="Professional Details" column={1}>
              <Descriptions.Item label="Design Style">{designer.style}</Descriptions.Item>
              <Descriptions.Item label="Price Range">{designer.priceRange}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={4}>Event Types</Title>
            <div style={{ marginBottom: 16 }}>
              {eventTypes.length > 0 ? (
                eventTypes.map((type) => (
                  <Tag color="blue" key={type} style={{ marginBottom: 8 }}>
                    {type}
                  </Tag>
                ))
              ) : (
                <Text type="secondary">No event types available</Text>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Designer Provider" style={{ marginBottom: 24 }}>
            <Descriptions column={1}>
              <Descriptions.Item label="Name">{designer.provider?.name || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Email">
                <MailOutlined /> {designer.provider?.email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                <PhoneOutlined /> {designer.provider?.phone || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          {/* Location */}
          <Card title="Location">
            <div style={{ height: "200px", background: "#f0f0f0", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <EnvironmentOutlined style={{ fontSize: 32 }} />
              <p style={{ marginLeft: 8 }}>{designer.location}</p>
            </div>
            <Button
              type="link"
              block
              href={`https://maps.google.com/?q=${encodeURIComponent(designer.location)}`}
              target="_blank"
              style={{ marginTop: 16 }}
            >
              View on Google Maps
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DesignerDetailPage