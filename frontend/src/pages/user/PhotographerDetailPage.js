import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, Row, Col, Typography, Descriptions, Image, Spin, Divider, Button } from "antd"
import { EnvironmentOutlined,MailOutlined,
  PhoneOutlined } from "@ant-design/icons"
import api from "../../services/api"

const { Title, Text, Paragraph } = Typography

const PhotographerDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [photographer, setPhotographer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPhotographer = async () => {
      try {
        const response = await api.get(`/api/photographers/${id}`)
        setPhotographer(response.data)
      } catch (error) {
        console.error("Error fetching photographer:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPhotographer()
  }, [id])

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!photographer) {
    return null
  }

  // Safe portfolio parsing
  let portfolioImages = []
  try {
    portfolioImages = photographer.portfolio ? JSON.parse(photographer.portfolio) : []
    if (!Array.isArray(portfolioImages)) {
      portfolioImages = []
    }
  } catch (error) {
    console.error("Invalid portfolio JSON:", error)
    portfolioImages = []
  }

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card bordered={false} style={{ marginBottom: 24 }}>
            <Title level={2}>{photographer.name}</Title>

            <Paragraph style={{ fontSize: 16 }}>
              <EnvironmentOutlined style={{ marginRight: 8 }} />
              {photographer.location}
            </Paragraph>

            <Divider />

            <Title level={4}>About the Photographer</Title>
            <Paragraph>{photographer.description}</Paragraph>

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
              <Descriptions.Item label="Photography Style">{photographer.style}</Descriptions.Item>
              <Descriptions.Item label="Experience">{photographer.experienceYears} years</Descriptions.Item>
              <Descriptions.Item label="Price Range">{photographer.priceRange}</Descriptions.Item>
              <Descriptions.Item label="Copy Type">{photographer.copyType}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
        <Card title="Photographer Provider" style={{ marginBottom: 24 }}>
            <Descriptions column={1}>
              <Descriptions.Item label="Name">{photographer.provider?.name || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Email">
                <MailOutlined /> {photographer.provider?.email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                <PhoneOutlined /> {photographer.provider?.phone || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          <Card title="Location">
            <div
              style={{
                height: "200px",
                background: "#f0f0f0",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
            
              <EnvironmentOutlined style={{ fontSize: 32 }} />
              <p style={{ marginLeft: 8 }}>{photographer.location}</p>
            </div>
            <Button
              type="link"
              block
              href={`https://maps.google.com/?q=${encodeURIComponent(photographer.location)}`}
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

export default PhotographerDetailPage
