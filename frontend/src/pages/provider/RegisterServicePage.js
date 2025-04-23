import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

const RegisterServicePage = ({ providerType, onFinish, loading }) => {
  const [serviceType, setServiceType] = useState(providerType || "venue");
  const [canRegister, setCanRegister] = useState(true); // Default to true for now
  const [userData, setUserData] = useState(null);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        setUserData(response.data);
        
        // Check if user can register services
        const userCanRegister = 
          response.data && 
          response.data.role === 'PROVIDER' && 
          response.data.providerStatus === 'APPROVED';
        
        setCanRegister(userCanRegister);
        console.log('User can register:', userCanRegister);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setCanRegister(false);
      }
    };

    fetchUserData();
  }, []);

  // Update service type when provider type changes
  useEffect(() => {
    if (providerType) {
      setServiceType(providerType);
    }
  }, [providerType]);

  // Debug logs to help troubleshoot
  useEffect(() => {
    console.log('Current state:', { 
      serviceType, 
      providerType, 
      canRegister,
      userData: userData ? `${userData.role}:${userData.providerStatus}` : 'not loaded'
    });
  }, [serviceType, providerType, canRegister, userData]);

  const handleTabChange = (key) => {
    if (!providerType) {
      setServiceType(key);
    }
  };

  // Prepare upload props
  const uploadProps = {
    beforeUpload: file => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
      }
      return isImage && isLt5M;
    },
    listType: 'picture',
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    
    // Add service type to form data
    formData.append('serviceType', serviceType);
    
    // Add other form fields to FormData
    for (const key in values) {
      if (key === 'images') {
        // Skip images for now - they're handled by Upload component
        continue;
      } else if (Array.isArray(values[key])) {
        formData.append(key, JSON.stringify(values[key]));
      } else {
        formData.append(key, values[key]);
      }
    }
    
    // Add image files
    if (values.images && values.images.fileList) {
      values.images.fileList.forEach(fileItem => {
        if (fileItem.originFileObj) {
          formData.append('images', fileItem.originFileObj);
        }
      });
    }

    try {
      console.log('Submitting form data...');
      const response = await axios.post('/api/services', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        message.success('Service submitted successfully for approval');
        if (onFinish) {
          onFinish(response.data);
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error submitting service';
      message.error(errorMsg);
      console.error('Service submission error:', error);
    }
  };

  return (
    <Card>
      <Tabs activeKey={serviceType} onChange={handleTabChange} type="card">
        {serviceTypes.map((service) => (
          <TabPane 
            tab={service.label} 
            key={service.key} 
            disabled={providerType && providerType !== service.key}
          >
            {service.key === 'venue' && (
              <Form 
                name="register_venue" 
                layout="vertical" 
                onFinish={handleSubmit}
              >
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
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                  >
                    Submit for Approval
                  </Button>
                  {!canRegister && userData && (
                    <div style={{ marginTop: '10px', color: 'red' }}>
                      Note: You must be an approved provider to register services.
                    </div>
                  )}
                </Form.Item>
              </Form>
            )}

            {service.key === 'photographer' && (
              <Form 
                name="register_photographer" 
                layout="vertical" 
                onFinish={handleSubmit}
              >
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
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                  >
                    Submit for Approval
                  </Button>
                  {!canRegister && userData && (
                    <div style={{ marginTop: '10px', color: 'red' }}>
                      Note: You must be an approved provider to register services.
                    </div>
                  )}
                </Form.Item>
              </Form>
            )}

            {service.key === 'designer' && (
              <Form 
                name="register_designer" 
                layout="vertical" 
                onFinish={handleSubmit}
              >
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
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                  >
                    Submit for Approval
                  </Button>
                  {!canRegister && userData && (
                    <div style={{ marginTop: '10px', color: 'red' }}>
                      Note: You must be an approved provider to register services.
                    </div>
                  )}
                </Form.Item>
              </Form>
            )}

            {service.key === 'catering' && (
              <Form 
                name="register_catering" 
                layout="vertical" 
                onFinish={handleSubmit}
              >
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
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                  >
                    Submit for Approval
                  </Button>
                  {!canRegister && userData && (
                    <div style={{ marginTop: '10px', color: 'red' }}>
                      Note: You must be an approved provider to register services.
                    </div>
                  )}
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