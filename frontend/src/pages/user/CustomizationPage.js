"use client"

import { useState } from "react"
import { Form, Input, InputNumber, Select, Button, Slider, Card, Row, Col, message } from "antd"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

const { Option } = Select

const CustomizationPage = () => {
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState(null)
  const navigate = useNavigate()

  const onFinish = async (values) => {
    try {
      setLoading(true)

      const response = await api.post("/recommendations", values)
      setRecommendations(response.data.recommendations)

      message.success("Recommendations generated successfully!")
    } catch (error) {
      message.error("Failed to generate recommendations")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const viewService = (serviceType, id) => {
    navigate(`/user/${serviceType}/${id}`)
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
            serviceType: "venue",
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
                  <Option value="conference">Conference</Option>
                  <Option value="social">Social Gathering</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="serviceType" label="Service Type" rules={[{ required: true }]}>
                <Select>
                  <Option value="venues">Venue</Option>
                  <Option value="catering">Catering</Option>
                  <Option value="photographers">Photographer</Option>
                  <Option value="designers">Event Designer</Option>
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
            <Slider
              min={5000}
              max={500000}
              step={5000}
              marks={{
                5000: "₱5k",
                100000: "₱100k",
                250000: "₱250k",
                500000: "₱500k",
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Get Recommendations
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {recommendations && (
        <Card title="Recommended Services">
          <Row gutter={[16, 16]}>
            {recommendations.map((service, index) => (
              <Col span={8} key={service.id}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={service.name}
                      src={service.images ? JSON.parse(service.images)[0] : "https://via.placeholder.com/300x200"}
                    />
                  }
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
      )}
    </div>
  )
}

export default CustomizationPage
