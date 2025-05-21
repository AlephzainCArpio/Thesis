import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Descriptions,
  Tag,
  Carousel,
  Spin,
  Divider,
  Button,
} from "antd";
import {
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import api from "../../services/api";

const { Title, Paragraph, Link } = Typography;

const safeJsonParse = (jsonString) => {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return [];
  }
};

const DesignerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [designer, setDesigner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDesigner = async () => {
      try {
        const response = await api.get(`/api/designers/${id}`);
        setDesigner(response.data);
      } catch (error) {
        console.error("Error fetching designer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDesigner();
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!designer) {
    return null;
  }

  const images = safeJsonParse(designer.images);
  const portfolio = designer.portfolio;
  const eventTypes = safeJsonParse(designer.eventTypes);

  return (
    <div className="designer-detail-page">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          {/* Image Carousel */}
          <Card style={{ marginBottom: 24 }}>
            {images.length > 0 ? (
              <Carousel autoplay>
                {images.map((image, index) => (
                  <div key={index}>
                    <div
                      style={{
                        height: "400px",
                        background: "#f0f0f0",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${designer.name} - Image ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
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
            <Title level={2}>{designer.name}</Title>

            <Paragraph>
              <EnvironmentOutlined /> {designer.location}
            </Paragraph>

            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Card size="small">
                  <div style={{ textAlign: "center" }}>
                    <CheckCircleOutlined
                      style={{ fontSize: 24, color: "#1890ff" }}
                    />
                    <div style={{ marginTop: 8 }}>
                      <strong>Design Style</strong>
                      <p>{designer.style || "N/A"}</p>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <div style={{ textAlign: "center" }}>
                    <CheckCircleOutlined
                      style={{ fontSize: 24, color: "#52c41a" }}
                    />
                    <div style={{ marginTop: 8 }}>
                      <strong>Price Range</strong>
                      <p>{designer.priceRange || "N/A"}</p>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            <Divider orientation="left">About the Designer</Divider>
            <Paragraph>{designer.description}</Paragraph>

            <Divider orientation="left">Portfolio</Divider>
            {portfolio ? (
              <Paragraph>
                <a href={portfolio} target="_blank" rel="noopener noreferrer">
                  View Portfolio
                </a>
              </Paragraph>
            ) : (
              <Paragraph>No portfolio available</Paragraph>
            )}

            <Divider orientation="left">Event Types</Divider>
            <div>
              {eventTypes.length > 0 ? (
                eventTypes.map((type, index) => (
                  <Tag key={index} color="blue" style={{ marginBottom: 8 }}>
                    {type}
                  </Tag>
                ))
              ) : (
                <Paragraph>No event types available</Paragraph>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          {/* Provider Details */}
          <Card title="Designer Provider" style={{ marginBottom: 24 }}>
            <Descriptions column={1}>
              <Descriptions.Item label="Name">
                {designer.provider?.name || "N/A"}
              </Descriptions.Item>
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
              <p style={{ marginLeft: 8 }}>{designer.location}</p>
            </div>
            <Button
              type="link"
              block
              href={`https://maps.google.com/?q=${encodeURIComponent(
                designer.location
              )}`}
              target="_blank"
              style={{ marginTop: 16 }}
            >
              View on Google Maps
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DesignerDetailPage;