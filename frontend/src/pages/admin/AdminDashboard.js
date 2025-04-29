import React, { useState, useEffect } from "react";
import { Card, Tabs, Form, Input, InputNumber, Select, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const AdminDashboard = () => {
  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState("venue");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get("/api/services");
      setServices(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    const data = new FormData();
    data.append("serviceType", activeTab);
    data.append("name", values.name);
    data.append("description", values.description);
    data.append("location", values.location);

    if (activeTab === "venue") {
      data.append("capacity", values.capacity);
      data.append("price", values.price);
      data.append("amenities", JSON.stringify(values.amenities));
    } else if (activeTab === "photographer") {
      data.append("hourlyRate", values.hourlyRate);
      data.append("packages", values.packages);
      data.append("photographyStyles", JSON.stringify(values.photographyStyles));
    } else if (activeTab === "designer") {
      data.append("price", values.price);
      data.append("designStyles", JSON.stringify(values.designStyles));
    } else if (activeTab === "catering") {
      data.append("maxPeople", values.maxPeople);
      data.append("pricePerPerson", values.pricePerPerson);
      data.append("cuisineTypes", JSON.stringify(values.cuisineTypes));
    }

    if (values.images) {
      values.images.forEach((file) => {
        data.append("images", file.originFileObj);
      });
    }

    try {
      setLoading(true);
      await axios.post("/api/services", data);
      message.success("Service added successfully!");
      fetchServices();
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error("Failed to add service.");
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: () => false,
    multiple: true,
  };

  const serviceTypes = [
    { label: "Venue", key: "venue" },
    { label: "Catering", key: "catering" },
    { label: "Photographer", key: "photographer" },
    { label: "Event Designer", key: "designer" },
  ];

  return (
    <div style={{ padding: "20px", backgroundColor: "#102b6b", minHeight: "100vh" }}>
      {/* SERVICES GRID */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginBottom: "40px" }}>
        {services.map((service) => (
          <div
            key={service.id}
            style={{
              backgroundColor: "#d1d5db",
              borderRadius: "8px",
              width: "200px",
              padding: "10px",
              textAlign: "center",
            }}
          >
            {service.images && service.images.length > 0 && (
              <img
                src={`/uploads/services/${service.images[0]}`}
                alt={service.name}
                style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "8px" }}
              />
            )}
            <h3 style={{ fontSize: "16px", margin: "10px 0 5px" }}>{service.name}</h3>
            <p style={{ fontSize: "14px", color: "#555" }}>{service.location}</p>
            {service.status === "APPROVED" ? (
              <div style={{ marginTop: "5px", color: "black" }}>★★★★★</div>
            ) : (
              <div style={{ marginTop: "5px", color: "black", fontWeight: "bold" }}>Pending Request</div>
            )}
          </div>
        ))}
      </div>

      {/* ADD SERVICE CARD */}
      <Card>
        <Tabs activeKey={activeTab} onChange={handleTabChange} type="card">
          {serviceTypes.map((service) => (
            <TabPane tab={service.label} key={service.key}>
              <Form layout="vertical" onFinish={handleSubmit} form={form}>
                <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter name!" }]}>
                  <Input placeholder={`Enter ${service.label.toLowerCase()} name`} />
                </Form.Item>

                <Form.Item name="description" label="Description" rules={[{ required: true, message: "Please enter description!" }]}>
                  <TextArea rows={4} placeholder={`Describe your ${service.label.toLowerCase()}`} />
                </Form.Item>

                <Form.Item name="location" label="Location" rules={[{ required: true, message: "Please enter location!" }]}>
                  <Input placeholder="Enter location" />
                </Form.Item>

                {service.key === "venue" && (
                  <>
                    <Form.Item name="capacity" label="Maximum Capacity" rules={[{ required: true, message: "Please enter capacity!" }]}>
                      <InputNumber min={1} style={{ width: "100%" }} placeholder="Max number of guests" />
                    </Form.Item>
                    <Form.Item name="price" label="Price (₱)" rules={[{ required: true, message: "Please enter price!" }]}>
                      <InputNumber min={0} style={{ width: "100%" }} placeholder="Rental fee" />
                    </Form.Item>
                    <Form.Item name="amenities" label="Amenities">
                      <Select mode="tags" placeholder="Enter amenities">
                        <Option value="parking">Parking</Option>
                        <Option value="wifi">WiFi</Option>
                        <Option value="air-conditioning">Air Conditioning</Option>
                        <Option value="sound-system">Sound System</Option>
                      </Select>
                    </Form.Item>
                  </>
                )}

                {service.key === "photographer" && (
                  <>
                    <Form.Item name="hourlyRate" label="Hourly Rate (₱)" rules={[{ required: true, message: "Please enter hourly rate!" }]}>
                      <InputNumber min={0} style={{ width: "100%" }} placeholder="Hourly rate" />
                    </Form.Item>
                    <Form.Item name="packages" label="Packages">
                      <TextArea rows={4} placeholder="Describe your package options" />
                    </Form.Item>
                    <Form.Item name="photographyStyles" label="Photography Styles">
                      <Select mode="tags" placeholder="Enter photography styles">
                        <Option value="traditional">Traditional</Option>
                        <Option value="photojournalistic">Photojournalistic</Option>
                        <Option value="artistic">Artistic</Option>
                        <Option value="candid">Candid</Option>
                        <Option value="vintage">Vintage</Option>
                      </Select>
                    </Form.Item>
                  </>
                )}

                {service.key === "designer" && (
                  <>
                    <Form.Item name="price" label="Base Price (₱)" rules={[{ required: true, message: "Please enter base price!" }]}>
                      <InputNumber min={0} style={{ width: "100%" }} placeholder="Starting price" />
                    </Form.Item>
                    <Form.Item name="designStyles" label="Design Styles">
                      <Select mode="tags" placeholder="Enter design styles">
                        <Option value="modern">Modern</Option>
                        <Option value="rustic">Rustic</Option>
                        <Option value="minimalist">Minimalist</Option>
                        <Option value="bohemian">Bohemian</Option>
                      </Select>
                    </Form.Item>
                  </>
                )}

                {service.key === "catering" && (
                  <>
                    <Form.Item name="maxPeople" label="Maximum People" rules={[{ required: true, message: "Please enter max people!" }]}>
                      <InputNumber min={1} style={{ width: "100%" }} placeholder="Max number of guests" />
                    </Form.Item>
                    <Form.Item name="pricePerPerson" label="Price Per Person (₱)" rules={[{ required: true, message: "Please enter price per person!" }]}>
                      <InputNumber min={0} style={{ width: "100%" }} placeholder="Price per person" />
                    </Form.Item>
                    <Form.Item name="cuisineTypes" label="Cuisine Types">
                      <Select mode="tags" placeholder="Enter cuisine types">
                        <Option value="filipino">Filipino</Option>
                        <Option value="chinese">Chinese</Option>
                        <Option value="japanese">Japanese</Option>
                        <Option value="italian">Italian</Option>
                        <Option value="american">American</Option>
                      </Select>
                    </Form.Item>
                  </>
                )}

                <Form.Item name="images" label="Images" valuePropName="fileList" getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}>
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Upload Images</Button>
                  </Upload>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    Add Service
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          ))}
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminDashboard;
