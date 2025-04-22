import React, { useState, useEffect } from 'react';
import { Card, Tabs, Form, Input, InputNumber, Button, Select, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const serviceTypes = [
  { key: "venue", label: "Venue" },
  { key: "photographer", label: "Photographer" },
  { key: "designer", label: "Designer" },
  { key: "catering", label: "Catering" }
];

const RegisterServicePage = ({ providerType, onFinish, loading, canRegister, uploadProps }) => {
  const [serviceType, setServiceType] = useState(providerType || "venue");

  // Ensure that the correct tab is selected based on providerType
  useEffect(() => {
    if (providerType) {
      setServiceType(providerType);
    }
  }, [providerType]);

  const handleTabChange = (key) => {
    if (!providerType) {
      setServiceType(key); // Allow tab change only if providerType is not set
    }
  };

  return (
    <Card>
      <Tabs 
        activeKey={serviceType} 
        onChange={handleTabChange} 
        disabled={providerType !== null} // Disable tab switching if providerType is set
      >
        {serviceTypes.map((service) => (
          <TabPane 
            tab={service.label} 
            key={service.key} 
            disabled={providerType && providerType !== service.key} // Disable tab if providerType does not match
          >
            {/* The form content for each service type will go here */}
            {service.key === 'venue' && (
              <Form name="register_venue" layout="vertical" onFinish={onFinish} disabled={!canRegister}>
                <Form.Item name="name" label="Venue Name" rules={[{ required: true, message: "Please enter venue name!" }]}>
                  <Input placeholder="Enter venue name" />
                </Form.Item>

                <Form.Item name="description" label="Description" rules={[{ required: true, message: "Please enter description!" }]}>
                  <TextArea rows={4} placeholder="Describe your venue" />
                </Form.Item>

                <Form.Item name="location" label="Location" rules={[{ required: true, message: "Please enter location!" }]}>
                  <Input placeholder="Full address" />
                </Form.Item>

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

                <Form.Item name="images" label="Photos">
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Upload Images</Button>
                  </Upload>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} disabled={!canRegister}>
                    Submit for Approval
                  </Button>
                </Form.Item>
              </Form>
            )}

            {service.key === 'photographer' && (
              <Form name="register_photographer" layout="vertical" onFinish={onFinish} disabled={!canRegister}>
                <Form.Item name="name" label="Business Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter business name" />
                </Form.Item>

                <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                  <TextArea rows={4} placeholder="Describe your photography services" />
                </Form.Item>

                <Form.Item name="location" label="Location" rules={[{ required: true }]}>
                  <Input placeholder="Full address" />
                </Form.Item>

                <Form.Item name="hourlyRate" label="Hourly Rate (₱)" rules={[{ required: true }]}>
                  <InputNumber min={0} style={{ width: "100%" }} placeholder="Hourly rate" />
                </Form.Item>

                <Form.Item name="packages" label="Packages (separate with commas)">
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

                <Form.Item name="experienceYears" label="Years of Experience" rules={[{ required: true }]}>
                  <InputNumber min={0} style={{ width: "100%" }} placeholder="Experience in years" />
                </Form.Item>

                <Form.Item name="images" label="Portfolio Photos">
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Upload Images</Button>
                  </Upload>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} disabled={!canRegister}>
                    Submit for Approval
                  </Button>
                </Form.Item>
              </Form>
            )}

            {service.key === 'designer' && (
              <Form name="register_designer" layout="vertical" onFinish={onFinish} disabled={!canRegister}>
                <Form.Item name="name" label="Business Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter business name" />
                </Form.Item>

                <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                  <TextArea rows={4} placeholder="Describe your design services" />
                </Form.Item>

                <Form.Item name="location" label="Location" rules={[{ required: true }]}>
                  <Input placeholder="Full address" />
                </Form.Item>

                <Form.Item name="price" label="Base Price (₱)" rules={[{ required: true }]}>
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

                <Form.Item name="images" label="Portfolio Images">
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Upload Images</Button>
                  </Upload>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} disabled={!canRegister}>
                    Submit for Approval
                  </Button>
                </Form.Item>
              </Form>
            )}

            {service.key === 'catering' && (
              <Form name="register_catering" layout="vertical" onFinish={onFinish} disabled={!canRegister}>
                <Form.Item name="name" label="Business Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter business name" />
                </Form.Item>

                <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                  <TextArea rows={4} placeholder="Describe your catering service" />
                </Form.Item>

                <Form.Item name="location" label="Location" rules={[{ required: true }]}>
                  <Input placeholder="Full address" />
                </Form.Item>

                <Form.Item name="maxPeople" label="Maximum People" rules={[{ required: true }]}>
                  <InputNumber min={1} style={{ width: "100%" }} placeholder="Max number of guests" />
                </Form.Item>

                <Form.Item name="pricePerPerson" label="Price Per Person (₱)" rules={[{ required: true }]}>
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

                <Form.Item name="dietaryOptions" label="Dietary Options">
                  <Select mode="tags" placeholder="Enter dietary options">
                    <Option value="vegetarian">Vegetarian</Option>
                    <Option value="vegan">Vegan</Option>
                    <Option value="gluten-free">Gluten-Free</Option>
                    <Option value="halal">Halal</Option>
                  </Select>
                </Form.Item>

                <Form.Item name="images" label="Food Photos">
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Upload Images</Button>
                  </Upload>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} disabled={!canRegister}>
                    Submit for Approval
                  </Button>
                </Form.Item>
              </Form>
            )}
          </TabPane>
        ))}
      </Tabs>
    </Card>
  );
};

export default RegisterServicePage;
