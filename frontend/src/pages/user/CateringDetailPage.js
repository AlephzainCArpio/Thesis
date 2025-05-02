import { useState, useEffect } from "react"
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Carousel,
  Tag,
  Divider,
  Spin,
  Descriptions
} from "antd"
import {
  EnvironmentOutlined,
  TeamOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CoffeeOutlined,
  MailOutlined,
  PhoneOutlined
} from "@ant-design/icons"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../services/api"

const { Title, Paragraph } = Typography


const safeParse = (str) => {
  try {
    return str && str !== "" ? JSON.parse(str) : []
  } catch (err) {
    return []
  }
}

const CateringDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [catering, setCatering] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCateringDetails()
  }, [id])

  const fetchCateringDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/catering/${id}`)
      setCatering(response.data)
    } catch (error) {
      console.error("Error fetching catering details:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!catering) {
    return null
  }

 
  const images = safeParse(catering.images)
  const dietaryOptions = safeParse(catering.dietaryOptions)

  return (
    <div className="catering-detail-page">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          {/* Images */}
          <Card style={{ marginBottom: 24 }}>
            {images.length > 0 ? (
              <Carousel autoplay>
                {images.map((image, index) => (
                  <div key={index}>
                    <div style={{ height: "400px", background: "#f0f0f0", overflow: "hidden" }}>
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${catering.name} - Image ${index + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  </div>
                ))}
              </Carousel>
            ) : (
              <div
                style={{
                  height: "400px",
                  background: "#f0f0f0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <p>No images available</p>
              </div>
            )}
          </Card>

          {/* Main Details */}
          <Card>
            <Title level={2}>{catering.name}</Title>

            <Paragraph>
              <EnvironmentOutlined /> {catering.location}
            </Paragraph>

            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: "center" }}>
                    <TeamOutlined style={{ fontSize: 24, color: "#1890ff" }} />
                    <div style={{ marginTop: 8 }}>
                      <strong>Maximum People</strong>
                      <p>{catering.maxPeople} people</p>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: "center" }}>
                    <DollarOutlined style={{ fontSize: 24, color: "#52c41a" }} />
                    <div style={{ marginTop: 8 }}>
                      <strong>Price Per Person</strong>
                      <p>₱{catering.pricePerPerson?.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: "center" }}>
                    <CoffeeOutlined style={{ fontSize: 24, color: "#fa8c16" }} />
                    <div style={{ marginTop: 8 }}>
                      <strong>Cuisine Type</strong>
                      <p>{catering.cuisineType}</p>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            <Divider orientation="left">Description</Divider>
            <Paragraph>{catering.description}</Paragraph>

            <Divider orientation="left">Dietary Options</Divider>
            <div>
              {dietaryOptions.map((option, index) => (
                <Tag key={index} color="green" style={{ margin: "0 8px 8px 0" }}>
                  <CheckCircleOutlined /> {option}
                </Tag>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
        <Card title="Catering Provider" style={{ marginBottom: 24 }}>
            <Descriptions column={1}>
              <Descriptions.Item label="Name">{catering.provider?.name || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Email">
                <MailOutlined /> {catering.provider?.email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                <PhoneOutlined /> {catering.provider?.phone || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Location */}
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
              <p style={{ marginLeft: 8 }}>{catering.location}</p>
            </div>
            <Button
              type="link"
              block
              href={`https://maps.google.com/?q=${encodeURIComponent(catering.location)}`}
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

export default CateringDetailPage
