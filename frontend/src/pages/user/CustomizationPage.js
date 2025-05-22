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

// AdminDashboard reference: expects images to be a JSON array of filenames, served as /uploads/[service]/[filename]
const getFirstImageUrl = (service, images, type) => {
  if (!images) return "https://via.placeholder.com/300x200"
  let imgArr
  try {
    imgArr = typeof images === "string" ? JSON.parse(images) : images
    if (!Array.isArray(imgArr)) return "https://via.placeholder.com/300x200"
  } catch {
    return "https://via.placeholder.com/300x200"
  }
  if (imgArr.length > 0 && typeof imgArr[0] === "string") {
    // type: venues, catering, photographers, designers
    let folder = type
    if (type === "catering") folder = "caterings"
    else if (type === "venue") folder = "venues"
    else if (type === "photographer") folder = "photographers"
    else if (type === "designer") folder = "designers"
    // fallback for plural/singular
    if (!folder.endsWith("s")) folder += "s"
    return `${process.env.REACT_APP_API_URL || ""}/uploads/${folder}/${imgArr[0]}`
  }
  return "https://via.placeholder.com/300x200"
}

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

      const payload = {
        serviceType,
        budget: values.budget,
      };

      if (selectedService === "venues" || selectedService === "catering") {
        payload.guests = values.guests;
      }

      if (selectedService === "venues" || selectedService === "designers") {
        payload.eventTypes = values.eventTypes;
      }

      console.log("Request Payload:", payload);

      const response = await api.post("/recommendation", payload);

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
                  src={getFirstImageUrl(service, service.images, selectedService)}
                  onError={e => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300x200" }}
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
    <div style={{ padding: "24px" }}>
      <h2>Customize Your Event</h2>
      <p>Tell us about your event and we'll find the perfect services for you.</p>

      <Card title="Event Details" style={{ marginBottom: 24 }}>
        <Form
          name="customization"
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 600, margin: "0 auto" }}
        >
          <Form.Item
            name="serviceType"
            label="Select Service Type"
            rules={[{ required: true, message: "Please select a service type." }]}
          >
            <Radio.Group onChange={onServiceTypeChange}>
              <Row gutter={[16, 16]}>
                <Col span={12}><Radio value="venues">Venue</Radio></Col>
                <Col span={12}><Radio value="catering">Catering</Radio></Col>
                <Col span={12}><Radio value="photographers">Photographer</Radio></Col>
                <Col span={12}><Radio value="designers">Event Designer</Radio></Col>
              </Row>
            </Radio.Group>
          </Form.Item>

          {(selectedService === "venues" || selectedService === "designers") && (
            <Form.Item
              name="eventTypes"
              label="Event Type"
              rules={[{ required: true, message: "Please select an event type." }]}
            >
              <Select placeholder="Select an event type">
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
              rules={[{ required: true, message: "Please enter the number of guests." }]}
            >
              <InputNumber
                min={1}
                max={100000}
                style={{ width: "100%" }}
                placeholder="Enter number of guests"
              />
            </Form.Item>
          )}

          <Form.Item
            name="budget"
            label="Budget (₱)"
            rules={[{ required: true, message: "Please enter your budget." }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={100}
              max={50000000000}
              step={5000}
              placeholder="Enter your budget"
              formatter={(value) =>
                `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/₱\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
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
        {recommendations && renderRecommendationCard("Best Match", recommendations.bestMatch)}
        {recommendations && renderRecommendationCard("Above Budget", recommendations.aboveBudget)}
        {recommendations && renderRecommendationCard("Below Budget", recommendations.belowBudget)}
      </Modal>
    </div>
  );
};

export default CustomizationPage;
