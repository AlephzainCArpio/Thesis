"use client"

import { useState } from "react"
import { Card, Typography, Upload, Button, message, Alert, Space } from "antd"
import { UploadOutlined, FileOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api" // Using services/api.js

const { Title, Text, Paragraph } = Typography

const ProviderVerificationPage = () => {
  const [fileList, setFileList] = useState([])
  const [uploading, setUploading] = useState(false)
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error("Please select a file to upload")
      return
    }

    const formData = new FormData()
    formData.append("document", fileList[0])

    setUploading(true)

    try {
      await api.post("/providers/verify", formData, {
        // Removed /api prefix
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      message.success("Document uploaded successfully! Your application is now pending review.")
      navigate("/provider/dashboard")
    } catch (error) {
      console.error("Error uploading document:", error)
      message.error("Failed to upload document. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const props = {
    onRemove: () => {
      setFileList([])
    },
    beforeUpload: (file) => {
      // Check file type
      const isValidType = file.type === "image/jpeg" || file.type === "image/png" || file.type === "application/pdf"

      if (!isValidType) {
        message.error("You can only upload JPG/PNG/PDF files!")
        return Upload.LIST_IGNORE
      }

      // Check file size (5MB max)
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isLt5M) {
        message.error("File must be smaller than 5MB!")
        return Upload.LIST_IGNORE
      }

      setFileList([file])
      return false
    },
    fileList,
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", paddingTop: 50 }}>
      <Card>
        <Title level={2}>Provider Verification</Title>

        <Alert
          message="Verification Required"
          description="To complete your registration as a service provider, please upload a document that verifies your business legitimacy (business permit, professional ID, or certification)."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Paragraph>
          Your document will be reviewed by our administrators. Once approved, you'll be able to list your services on
          our platform.
        </Paragraph>

        <div style={{ marginTop: 24 }}>
          <Text strong>Upload Verification Document:</Text>
          <Upload {...props} maxCount={1} listType="picture">
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
        </div>

        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Accepted formats: JPG, PNG, PDF (Max: 5MB)</Text>
        </div>

        <div style={{ marginTop: 24 }}>
          <Space>
            <Button
              type="primary"
              onClick={handleUpload}
              disabled={fileList.length === 0}
              loading={uploading}
              icon={<FileOutlined />}
            >
              Submit for Verification
            </Button>
            <Button onClick={() => navigate("/provider/dashboard")}>Skip for Now</Button>
          </Space>
        </div>
      </Card>
    </div>
  )
}

export default ProviderVerificationPage
