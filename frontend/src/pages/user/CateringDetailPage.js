import { useState, useEffect } from "react"
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Carousel,
  Descriptions,
  Tag,
  Divider,
  Spin,
  message,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Result,
  Select,
} from "antd"
import {
  EnvironmentOutlined,
  TeamOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  HeartOutlined,
  HeartFilled,
  CalendarOutlined,
  CoffeeOutlined,
} from "@ant-design/icons"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"

const { Title, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

const CateringDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const [catering, setCatering] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [inquiryModalVisible, setInquiryModalVisible] = useState(false)
  const [inquirySubmitting, setInquirySubmitting] = useState(false)
  const [inquirySuccess, setInquirySuccess] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchCateringDetails()
    if (currentUser) {
      checkIfFavorite()
      // Record view if user is logged in
      recordView()
    }
  }, [id, currentUser])

  const fetchCateringDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/catering/${id}`)
      setCatering(response.data)
    } catch (error) {
      console.error("Error fetching catering details:", error)
      message.error("Failed to load catering details")
      // Redirect to catering list if catering not found
      if (error.response && error.response.status === 404) {
        navigate("/user/catering")
      }
    } finally {
      setLoading(false)
    }
  }

  const checkIfFavorite = async () => {
    try {
      const response = await api.get(`/users/favorites/check?cateringId=${id}`)
      setIsFavorite(response.data.isFavorite)
    } catch (error) {
      console.error("Error checking favorite status:", error)
    }
  }

  const recordView = async () => {
    try {
      await api.post(`/catering/${id}/view`)
    } catch (error) {
      console.error("Error recording view:", error)
    }
  }

  const toggleFavorite = async () => {
    if (!currentUser) {
      message.info("Please login to save favorites")
      return
    }

    try {
      if (isFavorite) {
        await api.delete(`/users/favorites/catering/${id}`)
        message.success("Removed from favorites")
      } else {
        await api.post(`/users/favorites`, { cateringId: id })
        message.success("Added to favorites")
      }
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error("Error updating favorite:", error)
      message.error("Failed to update favorites")
    }
  }

  const handleInquirySubmit = async (values) => {
    if (!currentUser) {
      message.info("Please login to send inquiries")
      return
    }

    try {
      setInquirySubmitting(true)
      await api.post(`/inquiries/catering/${id}`, {
        ...values,
        eventDate: values.eventDate.format("YYYY-MM-DD"),
      })

      setInquirySuccess(true)
      form.resetFields()
    } catch (error) {
      console.error("Error submitting inquiry:", error)
      message.error("Failed to send inquiry")
    } finally {
      setInquirySubmitting(false)
    }
  }

  const resetInquiryModal = () => {
    setInquiryModalVisible(false)
    setTimeout(() => {
      setInquirySuccess(false)
    }, 300)
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Loading catering details...</p>
      </div>
    )
  }

  if (!catering) {
    return (
      <Result
        status="404"
        title="Catering Service Not Found"
        subTitle="Sorry, the catering service you are looking for does not exist or has been removed."
        extra={
          <Button type="primary" onClick={() => navigate("/user/catering")}>
            Back to Catering Services
          </Button>
        }
      />
    )
  }

  // Parse images from JSON string
  const images = catering.images ? JSON.parse(catering.images) : []

  // Parse dietary options from JSON string
  const dietaryOptions = catering.dietaryOptions ? JSON.parse(catering.dietaryOptions) : []

  return (
    <div className="catering-detail-page">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          {/* Catering Images */}
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

          {/* Catering Details */}
          <Card>
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}
            >
              <Title level={2} style={{ margin: 0 }}>
                {catering.name}
              </Title>
              <Button
                type="text"
                icon={isFavorite ? <HeartFilled style={{ color: "#ff4d4f" }} /> : <HeartOutlined />}
                onClick={toggleFavorite}
                size="large"
              />
            </div>

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

            <Divider orientation="left">Service Type</Divider>
            <Paragraph>{catering.serviceType}</Paragraph>

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
          {/* Provider Info */}
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
            <Button
              type="primary"
              block
              icon={<CalendarOutlined />}
              onClick={() => setInquiryModalVisible(true)}
              style={{ marginTop: 16 }}
            >
              Send Inquiry
            </Button>
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

      {/* Inquiry Modal */}
      <Modal
        title={inquirySuccess ? "Inquiry Sent" : "Send Inquiry"}
        open={inquiryModalVisible}
        onCancel={resetInquiryModal}
        footer={null}
      >
        {inquirySuccess ? (
          <Result
            status="success"
            title="Your inquiry has been sent successfully!"
            subTitle="The catering provider will contact you soon."
            extra={[
              <Button type="primary" key="close" onClick={resetInquiryModal}>
                Close
              </Button>,
            ]}
          />
        ) : (
          <Form form={form} layout="vertical" onFinish={handleInquirySubmit}>
            <Form.Item
              name="eventType"
              label="Event Type"
              rules={[{ required: true, message: "Please select event type" }]}
            >
              <Select>
                <Option value="wedding">Wedding</Option>
                <Option value="birthday">Birthday</Option>
                <Option value="corporate">Corporate Event</Option>
                <Option value="conference">Conference</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="eventDate"
              label="Event Date"
              rules={[{ required: true, message: "Please select event date" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="guestCount"
              label="Number of Guests"
              rules={[{ required: true, message: "Please enter number of guests" }]}
            >
              <InputNumber min={1} max={catering.maxPeople} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="message"
              label="Message"
              rules={[{ required: true, message: "Please enter your message" }]}
            >
              <TextArea rows={4} placeholder="Please include any specific requirements or questions you have." />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={inquirySubmitting} block>
                Send Inquiry
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  )
}

export default CateringDetailPage
