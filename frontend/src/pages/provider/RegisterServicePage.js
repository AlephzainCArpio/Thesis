import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Upload, message, Button } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { submitServiceData } from '../../services/api';

const { Option } = Select;

const RegisterServicePage = () => {
  const { currentUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const providerType = currentUser?.providerType;

  if (!currentUser) {
    return <div>Please log in to register a service.</div>;
  }

  if (!providerType) {
    return <div>Error: Your provider type is not set. Please contact admin.</div>;
  }

  const handleFormSubmit = async (values) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      
      // Add service type
      formData.append('serviceType', providerType);
      
      // Format numeric values
      if (values.experienceYears) {
        formData.append('experienceYears', parseInt(values.experienceYears));
      }
      if (values.priceRange) {
        formData.append('priceRange', values.priceRange.toString());
      }
      
      // Add all other fields
      Object.keys(values).forEach(key => {
        if (key !== 'images') {
          if (Array.isArray(values[key])) {
            formData.append(key, JSON.stringify(values[key]));
          } else if (values[key] !== undefined && values[key] !== null) {
            formData.append(key, values[key].toString());
          }
        }
      });
      
      // Add images
      if (values.images?.length > 0) {
        values.images.forEach((file) => {
          if (file.originFileObj) {
            formData.append('images', file.originFileObj);
          }
        });
      }
      
      const response = await submitServiceData(formData);
      message.success('Service registered successfully! Awaiting admin approval.');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to register service');
    } finally {
      setSubmitting(false);
    }
  };

  // Function to normalize file list for Upload component
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Register Your {providerType.charAt(0) + providerType.slice(1).toLowerCase()} Service</h2>
      
      {/* Debug info */}
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <p><strong>Provider Type:</strong> {providerType}</p>
        <p><strong>User ID:</strong> {currentUser.id}</p>
      </div>

      {/* Form based on provider type */}
      {providerType === 'VENUE' && <VenueForm onFinish={handleFormSubmit} normFile={normFile} submitting={submitting} />}
      {providerType === 'CATERING' && <CateringForm onFinish={handleFormSubmit} normFile={normFile} submitting={submitting} />}
      {providerType === 'PHOTOGRAPHER' && <PhotographerForm onFinish={handleFormSubmit} normFile={normFile} submitting={submitting} />}
      {providerType === 'DESIGNER' && <DesignerForm onFinish={handleFormSubmit} normFile={normFile} submitting={submitting} />}

      {/* Optional fallback */}
      {!['PHOTOGRAPHER', 'VENUE', 'CATERING', 'DESIGNER'].includes(providerType) && (
        <div>Unsupported provider type: {providerType}</div>
      )}
    </div>
  );
};
// Venue form
const VenueForm = ({ onFinish }) => {
  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item name="name" label="Venue Name" rules={[{ required: true, message: "Please enter venue name" }]}>
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description" rules={[{ required: true, message: "Please enter description" }]}>
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="location" label="Location" rules={[{ required: true, message: "Please enter location" }]}>
        <Input />
      </Form.Item>
      <Form.Item name="capacity" label="Capacity" rules={[{ required: true, message: "Please enter capacity" }]}>
        <InputNumber min={1} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="price" label="Price" rules={[{ required: true, message: "Please enter price" }]}>
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="amenities" label="Amenities">
        <Select mode="tags" placeholder="Enter amenities">
          <Option value="wifi">WiFi</Option>
          <Option value="parking">Parking</Option>
          <Option value="catering">Catering Allowed</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="images"
        label="Images"
        valuePropName="fileList"
        getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
      >
        <Upload listType="picture-card" multiple beforeUpload={() => false} accept="image/*" maxCount={5}>
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload>
      </Form.Item>
      <Form.Item>
        <button type="submit">Register Venue</button>
      </Form.Item>
    </Form>
  );
};

// Catering form
const CateringForm = ({ onFinish }) => {
  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item name="name" label="Catering Name" rules={[{ required: true, message: "Please enter catering name" }]}>
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description" rules={[{ required: true, message: "Please enter description" }]}>
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="location" label="Location" rules={[{ required: true, message: "Please enter location" }]}>
        <Input />
      </Form.Item>
      <Form.Item name="maxPeople" label="Maximum People" rules={[{ required: true, message: "Please enter max capacity" }]}>
        <InputNumber min={1} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="pricePerPerson" label="Price Per Person" rules={[{ required: true, message: "Please enter price per person" }]}>
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="cuisineType" label="Cuisine Type" rules={[{ required: true, message: "Please select cuisine type" }]}>
        <Select>
          <Option value="filipino">Filipino</Option>
          <Option value="chinese">Chinese</Option>
          <Option value="italian">Italian</Option>
        </Select>
      </Form.Item>
      <Form.Item name="dietaryOptions" label="Dietary Options">
        <Select mode="tags" placeholder="Enter dietary options">
          <Option value="vegetarian">Vegetarian</Option>
          <Option value="vegan">Vegan</Option>
          <Option value="gluten-free">Gluten-Free</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="images"
        label="Images"
        valuePropName="fileList"
        getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
      >
        <Upload listType="picture-card" multiple beforeUpload={() => false} accept="image/*" maxCount={5}>
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload>
      </Form.Item>
      <Form.Item>
        <button type="submit">Register Catering</button>
      </Form.Item>
    </Form>
  );
};

// Photographer form
const PhotographerForm = ({ onFinish }) => {
  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item name="name" label="Photographer Name" rules={[{ required: true, message: "Please enter photographer name" }]}>
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description" rules={[{ required: true, message: "Please enter description" }]}>
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="location" label="Location" rules={[{ required: true, message: "Please enter location" }]}>
        <Input />
      </Form.Item>
      <Form.Item name="style" label="Photography Style" rules={[{ required: true, message: "Please select a style" }]}>
        <Select>
          <Option value="traditional">Traditional</Option>
          <Option value="photojournalistic">Photojournalistic</Option>
          <Option value="contemporary">Contemporary</Option>
        </Select>
      </Form.Item>
      <Form.Item name="experienceYears" label="Years of Experience" rules={[{ required: true, message: "Please enter years of experience" }]}>
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="priceRange" label="Price Range" rules={[{ required: true, message: "Please enter a price range" }]}>
        <Input placeholder="e.g., 5000-10000" />
      </Form.Item>
      <Form.Item name="copyType" label="Copy Type" rules={[{ required: true, message: "Please select a copy type" }]}>
        <Select>
          <Option value="virtual">Virtual</Option>
          <Option value="physical">Physical</Option>
          <Option value="both">Both</Option>
        </Select>
      </Form.Item>
      <Form.Item name="portfolio" label="Portfolio URL">
        <Input placeholder="Enter portfolio link" />
      </Form.Item>
      <Form.Item
        name="images"
        label="Images"
        valuePropName="fileList"
        getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
      >
        <Upload listType="picture-card" multiple beforeUpload={() => false} accept="image/*" maxCount={5}>
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload>
      </Form.Item>
      <Form.Item>
        <button type="submit">Register Photographer</button>
      </Form.Item>
    </Form>
  );
};

// Designer form
const DesignerForm = ({ onFinish }) => {
  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item name="name" label="Designer Name" rules={[{ required: true, message: "Please enter designer name" }]}>
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description" rules={[{ required: true, message: "Please enter description" }]}>
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="location" label="Location" rules={[{ required: true, message: "Please enter location" }]}>
        <Input />
      </Form.Item>
      <Form.Item name="style" label="Design Style" rules={[{ required: true, message: "Please select a style" }]}>
        <Select>
          <Option value="modern">Modern</Option>
          <Option value="classic">Classic</Option>
          <Option value="minimalist">Minimalist</Option>
        </Select>
      </Form.Item>
      <Form.Item name="priceRange" label="Price Range" rules={[{ required: true, message: "Please enter a price range" }]}>
        <Input placeholder="e.g., 5000-15000" />
      </Form.Item>
      <Form.Item name="experienceYears" label="Years of Experience" rules={[{ required: true, message: "Please enter years of experience" }]}>
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="portfolio" label="Portfolio URL">
        <Input placeholder="Enter portfolio link" />
      </Form.Item>
      <Form.Item
        name="images"
        label="Images"
        valuePropName="fileList"
        getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
      >
        <Upload listType="picture-card" multiple beforeUpload={() => false} accept="image/*" maxCount={5}>
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload>
      </Form.Item>
      <Form.Item>
        <button type="submit">Register Designer</button>
      </Form.Item>
    </Form>
  );
};

export default RegisterServicePage;
