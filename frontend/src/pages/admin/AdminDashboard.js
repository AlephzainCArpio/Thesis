import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Tabs,
  message,
  Spin,
  Button
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import "../../theme/vibrantFormOverride.css";

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const AdminDashboard = () => {
  const [services, setServices] = useState({
    venues: [],
    caterings: [],
    photographers: [],
    designers: []
  });
  const [activeTab, setActiveTab] = useState("VENUE");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

  const fetchServices = useCallback(async () => {
    try {
      setPageLoading(true);
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [venuesRes, cateringsRes, photographersRes, designersRes] =
        await Promise.all([
          axios.get(`${API_URL}/api/venues`, config),
          axios.get(`${API_URL}/api/catering`, config),
          axios.get(`${API_URL}/api/photographers`, config),
          axios.get(`${API_URL}/api/designers`, config)
        ]);

      console.log("Venues Response:", venuesRes.data);

      setServices({
        venues: venuesRes.data.venues || [],
        caterings: cateringsRes.data || [],
        photographers: photographersRes.data || [],
        designers: designersRes.data || []
      });
    } catch (error) {
      console.error("Error fetching services:", error);
      message.error("Failed to fetch services");
    } finally {
      setPageLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const data = new FormData();

      Object.keys(values).forEach((key) => {
        if (key !== "images") {
          if (Array.isArray(values[key])) {
            data.append(key, JSON.stringify(values[key]));
          } else if (values[key] !== undefined && values[key] !== null) {
            data.append(key, values[key]);
          }
        }
      });

      if (activeTab === "CATERING" || activeTab === "PHOTOGRAPHER") {
        data.append("serviceType", activeTab);
      }

      if (values.images && values.images.length > 0) {
        values.images.forEach((file) => {
          data.append("images", file.originFileObj);
        });
      }

      let endpoint = "";
      switch (activeTab) {
        case "VENUE":
          endpoint = "/api/venues";
          break;
        case "CATERING":
          endpoint = "/api/catering";
          break;
        case "PHOTOGRAPHER":
          endpoint = "/api/photographers";
          break;
        case "DESIGNER":
          endpoint = "/api/designers";
          break;
        default:
          throw new Error("Unsupported service type");
      }

      await axios.post(`${API_URL}${endpoint}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });

      message.success("Service added successfully!");
      fetchServices();
      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error adding service:", error);
      message.error(
        error.response?.data?.message || "Failed to add service"
      );
    } finally {
      setLoading(false);
    }
  };

  const serviceTypes = [
    { label: "Venue", key: "VENUE" },
    { label: "Catering", key: "CATERING" },
    { label: "Photographer", key: "PHOTOGRAPHER" },
    { label: "Designer", key: "DESIGNER" }
  ];

  const safeJsonParse = (json) => {
    if (!json) return null;
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  const getFirstImage = (imagesField) => {
    if (!imagesField) return null;
    
    const parsed = safeJsonParse(imagesField);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed[0];
    }
    
    if (typeof imagesField === "string" && imagesField.trim() !== "") {
      return imagesField;
    }
    return null;
  };

  const renderServiceCards = (type) => {
    const serviceList = services[type.toLowerCase() + "s"];
    console.log("Service List for", type, serviceList);

    if (!Array.isArray(serviceList) || serviceList.length === 0) {
      console.log("No services found for", type);
      return <p>No services found</p>;
    }

    return serviceList.map((service) => {
      const firstImage = getFirstImage(service.images);

      let imagePath;
      if (firstImage) {
        if (type === "VENUE") {
          imagePath = `${API_URL}/uploads/venues/${firstImage}`;
        } else if (type === "CATERING") {
          imagePath = `${API_URL}/uploads/catering/${firstImage}`;
        } else {
          imagePath = `${API_URL}/uploads/${type.toLowerCase()}s/${firstImage}`;
        }
      } else {
        imagePath = "/placeholder.jpg"; // fallback image
      }

      return (
        <Card
          key={service.id}
          style={{
            width: 300,
            marginBottom: 16,
            backgroundColor: "#fff",
            borderRadius: 8,
            overflow: "hidden"
          }}
        >
          <div style={{ height: 200, overflow: "hidden" }}>
            <img
              src={imagePath}
              alt={service.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder.jpg";
              }}
            />
          </div>
          <div style={{ padding: 16 }}>
            <h3>{service.name}</h3>
            <p>{service.location}</p>
            <p>
              Status:{" "}
              <span
                style={{
                  color:
                    service.status === "APPROVED" ? "#52c41a" : "#faad14",
                  fontWeight: "bold"
                }}
              >
                {service.status}
              </span>
            </p>
          </div>
        </Card>
      );
    });
  };

  if (pageLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f0f2f5"
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24
          }}
        >
          <h1 style={{ margin: 0 }}>Service Management</h1>
          <Button
            type="primary"
            onClick={() => setIsModalVisible(true)}
            style={{
              padding: "8px 24px",
              fontWeight: 700,
              fontSize: 17
            }}
          >
            Add New Service
          </Button>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {serviceTypes.map((type) => (
            <TabPane tab={type.label} key={type.key}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                {renderServiceCards(type.key)}
              </div>
            </TabPane>
          ))}
        </Tabs>

        <Modal
          title={`Add New ${activeTab.charAt(0)}${activeTab.slice(1).toLowerCase()}`}
          visible={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={720}
        >
          <div className="vibrant-form-card">
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: "Please enter name" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: "Please enter description" }]}
              >
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item
                name="location"
                label="Location"
                rules={[{ required: true, message: "Please enter location" }]}
              >
                <Input />
              </Form.Item>

              {activeTab === "VENUE" && (
                <>
                  <Form.Item
                    name="capacity"
                    label="Capacity"
                    rules={[{ required: true, message: "Please enter capacity" }]}
                  >
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    name="price"
                    label="Price"
                    rules={[{ required: true, message: "Please enter price" }]}
                  >
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item name="eventTypes" label="Event Types">
                    <Select>
                      <Option value="wedding">Wedding</Option>
                      <Option value="birthday">Birthday Party</Option>
                      <Option value="corporate">Corporate Event</Option>
                      <Option value="reunion">Reunion</Option>
                      <Option value="social">Social Gathering</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item name="amenities" label="Amenities">
                    <Select mode="tags" placeholder="Enter amenities">
                      <Option value="wifi">WiFi</Option>
                      <Option value="parking">Parking</Option>
                      <Option value="catering">Catering Allowed</Option>
                    </Select>
                  </Form.Item>
                </>
              )}

              {activeTab === "CATERING" && (
                <>
                  <Form.Item
                    name="maxPeople"
                    label="Maximum People"
                    rules={[
                      { required: true, message: "Please enter max capacity" }
                    ]}
                  >
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    name="pricePerPerson"
                    label="Price Per Person"
                    rules={[
                      { required: true, message: "Please enter price per person" }
                    ]}
                  >
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    name="cuisineType"
                    label="Cuisine Type"
                    rules={[{ required: true, message: "Please select cuisine" }]}
                  >
                    <Select placeholder="Enter Cuisine Type">
                      <Option value="filipino">Filipino</Option>
                      <Option value="chinese">Chinese</Option>
                      <Option value="italian">Italian</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="dietaryOptions" label="Dietary Options">
                    <Select placeholder="Enter dietary options">
                      <Option value="vegetarian">Vegetarian</Option>
                      <Option value="vegan">Vegan</Option>
                      <Option value="gluten-free">Gluten-Free</Option>
                      <Option value="protein">Protein</Option>
                    </Select>
                  </Form.Item>
                </>
              )}

              {activeTab === "PHOTOGRAPHER" && (
                <>
                  <Form.Item
                    name="style"
                    label="Photography Style"
                    rules={[{ required: true, message: "Please select style" }]}
                  >
                    <Select>
                      <Option value="traditional">Traditional</Option>
                      <Option value="photojournalistic">Photojournalistic</Option>
                      <Option value="contemporary">Contemporary</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="experienceYears"
                    label="Years of Experience"
                    rules={[{ required: true, message: "Please enter experience" }]}
                  >
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    name="priceRange"
                    label="Price Range"
                    rules={[{ required: true, message: "Please enter range" }]}
                  >
                    <Input placeholder="e.g., 5000-10000" />
                  </Form.Item>
                  <Form.Item
                    name="copyType"
                    label="Copy Type"
                    rules={[{ required: true, message: "Please select copy type" }]}
                  >
                    <Select>
                      <Option value="virtual">Virtual</Option>
                      <Option value="physical">Physical</Option>
                      <Option value="both">Both</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="portfolio" label="Portfolio URL">
                    <Input placeholder="Enter portfolio link" />
                  </Form.Item>
                </>
              )}

              {activeTab === "DESIGNER" && (
                <>
                  <Form.Item
                    name="style"
                    label="Design Style"
                    rules={[{ required: true, message: "Please select style" }]}
                  >
                    <Select>
                      <Option value="modern">Modern</Option>
                      <Option value="classic">Classic</Option>
                      <Option value="minimalist">Minimalist</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="priceRange"
                    label="Price Range"
                    rules={[{ required: true, message: "Please enter price range" }]}
                  >
                    <Input placeholder="e.g., 20000-50000" />
                  </Form.Item>
                  <Form.Item name="eventTypes" label="Event Types">
                    <Select>
                      <Option value="wedding">Wedding</Option>
                      <Option value="birthday">Birthday Party</Option>
                      <Option value="corporate">Corporate Event</Option>
                      <Option value="reunion">Reunion</Option>
                      <Option value="social">Social Gathering</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="portfolio" label="Portfolio URL">
                    <Input placeholder="Enter portfolio link" />
                  </Form.Item>
                </>
              )}

              <Form.Item
                name="images"
                label="Images"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
              >
                <Upload
                  listType="picture-card"
                  multiple
                  beforeUpload={() => false}
                  accept="image/*"
                  maxCount={5}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AdminDashboard;
