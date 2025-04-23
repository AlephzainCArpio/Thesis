import React, { useState } from 'react';
import { Card, Tabs, Form, Input, InputNumber, Button, Select, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const serviceTypes = [
  { key: "venue", label: "Venues" },
  { key: "photographer", label: "Photographers" },
  { key: "designer", label: "Designers" },
  { key: "catering", label: "Caterings" },
];

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("venue");
  const [loading, setLoading] = useState(false);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("serviceType", activeTab);

    for (const key in values) {
      if (key === "images") {
        values.images.fileList.forEach((file) => {
          formData.append("images", file.originFileObj);
        });
      } else {
        formData.append(key, Array.isArray(values[key]) ? JSON.stringify(values[key]) : values[key]);
      }
    }

    try {
      setLoading(true);
      const response = await fetch('/api/services', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        message.success("Service added successfully!");
      } else {
        throw new Error("Failed to add service");
      }
    } catch (error) {
      message.error(error.message || "Error adding service");
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isImage) message.error('You can only upload image files!');
      if (!isLt5M) message.error('Image must be smaller than 5MB!');
      return isImage && isLt5M;
    },
    listType: 'picture',
  };

  return (
    <Card>
      <Tabs activeKey={activeTab} onChange={handleTabChange} type="card">
        {serviceTypes.map((service) => (
          <TabPane tab={service.label} key={service.key}>
            <Form layout="vertical" onFinish={handleSubmit}>
              <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter name!" }]}>
                <Input placeholder={`Enter ${service.label.toLowerCase()} name`} />
              </Form.Item>

              <Form.Item name="description" label="Description" rules={[{ required: true, message: "Please enter description!" }]}>
                <TextArea rows={4} placeholder={`Describe your ${service.label.toLowerCase()}`} />
              </Form.Item>

              <Form.Item name="location" label="Location" rules={[{ required: true, message: "Please enter location!" }]}>
                <Input placeholder="Enter location" />
              </Form.Item>

              {activeTab === "venue" && (
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

              {activeTab === "photographer" && (
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

              {activeTab === "designer" && (
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

              {activeTab === "catering" && (
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

              <Form.Item name="images" label="Images">
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>Upload Images</Button>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Add Service
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        ))}
      </Tabs>
    </Card>
  );
};

export default AdminDashboardPage;