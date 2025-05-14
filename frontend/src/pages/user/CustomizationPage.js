import { useState } from "react";
import {
  Form,
  InputNumber,
  Select,
  Button,
  Row,
  Col,
  message,
  Radio,
  Card,
  Modal,
} from "antd";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const { Option } = Select;

const serviceTypeMapping = {
  venues: "VENUE",
  catering: "CATERING",
  photographers: "PHOTOGRAPHER",
  designers: "DESIGNER",
};

const CustomizationPage = () => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [selectedService, setSelectedService] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const serviceType = serviceTypeMapping[selectedService] || selectedService;

      // Prepare the event payload
      const payload = {
        serviceType,
        budget: values.budget,
      };

      // Include the 'guests' field if needed
      if (selectedService === "venues" || selectedService === "catering") {
        payload.guests = values.guests;
      }

      // Include the 'eventTypes' field if needed
      if (selectedService === "venues" || selectedService === "designers") {
        payload.eventTypes = values.eventTypes;
      }

      console.log("Request Payload:", payload);

      // Call the recommendation API
      const response = await api.post("/recommendation", payload);

      // Handle recommendations
      if (response.data && response.data.recommendations) {
        setRecommendations(response.data.recommendations);
        setIsModalVisible(true);
      } else {
        message.warning("No recommendations found.");
      }
    } catch (error) {
      console.error("Error during recommendation request:", error.response || error);
      message.error(
        error.response?.data?.message || "Failed to generate recommendations"
      );
    } finally {
      setLoading(false);
    }
  };

  const onServiceTypeChange = (e) => {
    setSelectedService(e.target.value);
  };

  const renderRecommendationCard = (title, services) => (
    <Card title={title} style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        {services.map((service) => (
          <Col span={8} key={service.id}>
            <Card
              hoverable
              cover={
                <img
                  alt={service.name}
                  src={
                    service.images && service.images.length > 0
                      ? JSON.parse(service.images)[0]
                      : "https://via.placeholder.com/300x200"
                  }
                />
              }
            >
              <Card.Meta
                title={service.name}
                description={
                  <>
                    <p>{service.location}</p>
                    <p>{service.description?.substring(0, 100)}...</p>
                    {service.price && (
                      <p>Price: ₱{service.price.toLocaleString()}</p>
                    )}
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );

  return (
    <div>
      <h2>Customize Your Event</h2>
      <p>Tell us about your event and we'll find the perfect services for you.</p>

      <Card title="Event Details" style={{ marginBottom: 24 }}>
        <Form name="customization" layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="serviceType"
            label="Select Service Type"
            rules={[{ required: true, message: "Please select a service type." }]}
          >
            <Radio.Group onChange={onServiceTypeChange}>
              <Radio value="venues">Venue</Radio>
              <Radio value="catering">Catering</Radio>
              <Radio value="photographers">Photographer</Radio>
              <Radio value="designers">Event Designer</Radio>
            </Radio.Group>
          </Form.Item>

          {(selectedService === "venues" || selectedService === "designers") && (
            <Form.Item
              name="eventTypes"
              label="Event Types"
              rules={[{ required: true, message: "Please select an event type." }]}
            >
              <Select>
                <Option value="wedding">Wedding</Option>
                <Option value="birthday">Birthday Party</Option>
                <Option value="corporate">Corporate Event</Option>
                <Option value="reunion">Reunion</Option>
                <Option value="social">Social Gathering</Option>
              </Select>
            </Form.Item>
          )}

          {(selectedService === "venues" || selectedService === "catering") && (
            <Form.Item
              name="guests"
              label="Number of Guests"
              rules={[
                { required: true, message: "Please enter the number of guests." },
              ]}
            >
              <InputNumber min={1} max={1000} style={{ width: "100%" }} />
            </Form.Item>
          )}

          <Form.Item
            name="budget"
            label="Budget (₱)"
            rules={[{ required: true, message: "Please enter your budget." }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={5000}
              max={500000}
              step={5000}
              formatter={(value) => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/₱\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Get Recommendations
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title="Recommendations"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {recommendations && renderRecommendationCard("Best Match", recommendations.best_match)}
        {recommendations && renderRecommendationCard("Above Budget", recommendations.above_budget)}
        {recommendations && renderRecommendationCard("Below Budget", recommendations.below_budget)}
      </Modal>
    </div>
  );
};

export default CustomizationPage;