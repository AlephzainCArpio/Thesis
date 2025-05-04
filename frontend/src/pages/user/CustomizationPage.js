import { useState } from "react"
import { Form, Input, InputNumber, Select, Button, Row, Col, message, Checkbox, Card, Tooltip } from "antd"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

const { Option } = Select

const CustomizationPage = () => {
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState(null)
  const [selectedService, setSelectedService] = useState([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)  // New loading state for recommendations
  const navigate = useNavigate()

  const onFinish = async (values) => {
    try {
      setLoading(true)
      setLoadingRecommendations(true)  // Start loading recommendations

      // Add the selected services to the request data
      const data = {
        ...values,
        serviceType: selectedService.join(", "), // Convert the array to a string of selected services
      }

      const response = await api.post("/recommend", data)

      // Ensure that the response contains recommendations
      if (response.data && response.data.recommendations) {
        setRecommendations(response.data.recommendations)
        message.success("Recommendations generated successfully!")
      } else {
        message.warning("No recommendations found.")
      }
    } catch (error) {
      message.error("Failed to generate recommendations")
      console.error(error)
    } finally {
      setLoading(false)
      setLoadingRecommendations(false)  // Stop loading recommendations
    }
  }

  const onServiceTypeChange = (checkedValues) => {
    setSelectedService(checkedValues)
  }

  const viewService = (serviceType, id) => {
    navigate(`/user/${serviceType}/${id}`)
  }

  const renderServiceImage = (service) => {
    return service.images && service.images.length > 0
      ? JSON.parse(service.images)[0]
      : "https://via.placeholder.com/300x200"
  }

  return (
    <div>
      <h2>Customize Your Event</h2>
      <p>Tell us about your event and we'll find the perfect services for you.</p>

      <Card title="Event Details" style={{ marginBottom: 24 }}>
        <Form
          name="customization"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            eventType: "wedding",
            budget: 50000,
            guests: 100,
          }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="eventType" label="Event Type" rules={[{ required: true }]}>
                <Select>
                  <Option value="wedding">Wedding</Option>
                  <Option value="birthday">Birthday Party</Option>
                  <Option value="corporate">Corporate Event</Option>
                  <Option value="reunion">Reunion</Option>
                  <Option value="social">Social Gathering</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="location" label="Location" rules={[{ required: true }]}>
                <Input placeholder="e.g., Bulan, Sorsogon" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="guests" label="Number of Guests" rules={[{ required: true }]}>
                <InputNumber min={1} max={1000} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="budget" label="Budget (₱)" rules={[{ required: true }]}>
            <InputNumber
              style={{ width: "100%" }}
              min={5000}
              max={500000}
              step={5000}
              formatter={(value) => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/₱\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item name="serviceType" label="Select Service Types" rules={[{ required: true }]}>
            <Checkbox.Group onChange={onServiceTypeChange}>
              <Row gutter={16}>
                <Col span={8}>
                  <Tooltip title="Choose a venue for your event">
                    <Checkbox value="venues">Venue</Checkbox>
                  </Tooltip>
                </Col>
                <Col span={8}>
                  <Tooltip title="Catering services for your event">
                    <Checkbox value="catering">Catering</Checkbox>
                  </Tooltip>
                </Col>
                <Col span={8}>
                  <Tooltip title="Photographers for capturing moments">
                    <Checkbox value="photographers">Photographer</Checkbox>
                  </Tooltip>
                </Col>
                <Col span={8}>
                  <Tooltip title="Designers to set up the perfect atmosphere">
                    <Checkbox value="designers">Event Designer</Checkbox>
                  </Tooltip>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Get Recommendations
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {loadingRecommendations ? (
        <p>Loading recommendations...</p>
      ) : recommendations && recommendations.length > 0 ? (
        <Card title="Recommended Services">
          <Row gutter={[16, 16]}>
            {recommendations.map((service) => (
              <Col span={8} key={service.id}>
                <Card
                  hoverable
                  cover={<img alt={service.name} src={renderServiceImage(service)} />}
                  onClick={() => viewService(service.type, service.id)}
                >
                  <Card.Meta
                    title={service.name}
                    description={
                      <>
                        <p>{service.location}</p>
                        <p>{service.description.substring(0, 100)}...</p>
                        {service.price && <p>Price: ₱{service.price.toLocaleString()}</p>}
                      </>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      ) : (
        recommendations && <p>No recommendations available.</p>
      )}
    </div>
  )
}

export default CustomizationPage
